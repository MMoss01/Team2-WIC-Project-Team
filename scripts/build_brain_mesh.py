"""Build public/models/brain.glb: a 3D brain split into the atlas's regions.

Follows the approach in Brainder's posts on bringing FreeSurfer meshes into
Blender (https://brainder.org/2012/05/08/importing-freesurfer-cortical-meshes-into-blender/),
but writes glTF directly with Python instead of going through ASCII/OBJ files.

    Cortex       fsaverage5 pial surface (bundled with nilearn), split into
                 lobes using the Desikan-Killiany "aparc" labels.
    Subcortical  FreeSurfer "aseg" volume for fsaverage, turned into surfaces
                 with marching cubes (same coordinate space as the cortex).
    Markers      The substantia nigra and olfactory bulb aren't in aseg or
                 aparc, so they're small ellipsoids at approximate positions.

Every mesh is named "<RegionId>_<lh|rh>" (brainstem regions use "_mid"),
matching the RegionId values in src/data/regions.ts.

Usage:
    pip install -r scripts/requirements.txt
    python scripts/build_brain_mesh.py

The FreeSurfer label and volume files (about 3 MB) are downloaded once from
the MNE testing-data repository into scripts/.cache/.
"""

from __future__ import annotations

import argparse
import os
import urllib.request
from pathlib import Path

import nibabel as nib
import nilearn
import numpy as np
import trimesh
from nilearn import surface
from skimage import measure

ROOT = Path(__file__).resolve().parent.parent
CACHE = Path(__file__).resolve().parent / ".cache"
DEFAULT_OUT = ROOT / "public" / "models" / "brain.glb"

MNE_RAW = "https://raw.githubusercontent.com/mne-tools/mne-testing-data/master/subjects/fsaverage"
FS_FILES = ["label/lh.aparc.annot", "label/rh.aparc.annot", "mri/aseg.mgz"]

FS5 = Path(nilearn.__file__).parent / "datasets" / "data" / "fsaverage5"
FS5_VERTS = 10242  # fsaverage5 vertices are the first 10242 of fsaverage

# Desikan-Killiany labels -> atlas regions. Lobe groupings follow common
# convention; insula and cingulate are folded into neighboring lobes to keep
# the region count small.
APARC_TO_REGION = {
    "precentral": "motor",
    "entorhinal": "entorhinal",
    **{n: "frontal" for n in [
        "superiorfrontal", "rostralmiddlefrontal", "caudalmiddlefrontal", "parsopercularis",
        "parstriangularis", "parsorbitalis", "lateralorbitofrontal", "medialorbitofrontal",
        "frontalpole", "paracentral", "rostralanteriorcingulate", "caudalanteriorcingulate",
    ]},
    **{n: "parietal" for n in [
        "postcentral", "superiorparietal", "inferiorparietal", "supramarginal", "precuneus",
        "posteriorcingulate", "isthmuscingulate",
    ]},
    **{n: "occipital" for n in ["lateraloccipital", "lingual", "cuneus", "pericalcarine"]},
    **{n: "temporal" for n in [
        "superiortemporal", "middletemporal", "inferiortemporal", "bankssts", "fusiform",
        "transversetemporal", "temporalpole", "parahippocampal", "insula",
    ]},
}

# FreeSurfer aseg label numbers -> atlas regions, per hemisphere.
ASEG = {
    "lh": {"hippocampus": [17], "amygdala": [18], "striatum": [11, 12, 26], "thalamus": [10], "cerebellum": [7, 8]},
    "rh": {"hippocampus": [53], "amygdala": [54], "striatum": [50, 51, 58], "thalamus": [49], "cerebellum": [46, 47]},
}
BRAINSTEM = 16

# The aseg brainstem is one structure. Split it by height (FreeSurfer z, mm)
# into rough midbrain / pons / medulla bands. Approximate by design.
PONS_TOP_Z = -18.0
MEDULLA_TOP_Z = -40.0

# Ellipsoid markers for structures the atlases don't segment, in FreeSurfer
# RAS (mm): center, radii.
MARKERS = {
    "nigra": [((-10.0, -18.0, -10.0), (3.0, 6.0, 2.5)), ((10.0, -18.0, -10.0), (3.0, 6.0, 2.5))],
    "olfactory": [((-8.0, 28.0, -24.0), (2.5, 14.0, 2.5)), ((8.0, 28.0, -24.0), (2.5, 14.0, 2.5))],
}


def fetch_fs_files() -> Path:
    base = CACHE / "fsaverage"
    for rel in FS_FILES:
        dest = base / rel
        if dest.exists():
            continue
        dest.parent.mkdir(parents=True, exist_ok=True)
        url = f"{MNE_RAW}/{rel}"
        print(f"downloading {url}")
        urllib.request.urlretrieve(url, dest)
    return base


def cortex_meshes(fs_dir: Path) -> dict[str, trimesh.Trimesh]:
    out: dict[str, trimesh.Trimesh] = {}
    for hemi, side in [("lh", "left"), ("rh", "right")]:
        verts, faces = surface.load_surf_mesh(str(FS5 / f"pial_{side}.gii.gz"))
        verts = np.asarray(verts, dtype=np.float64)
        faces = np.asarray(faces)
        labels, _, names = nib.freesurfer.read_annot(str(fs_dir / f"label/{hemi}.aparc.annot"))
        names = [n.decode() for n in names]
        labels = labels[:FS5_VERTS]

        vert_region = np.array(
            [APARC_TO_REGION.get(names[l], "medialwall") if l >= 0 else "medialwall" for l in labels]
        )
        # Each face takes its first vertex's region, so regions tile with no gaps.
        face_region = vert_region[faces[:, 0]]
        for region in np.unique(face_region):
            sub = trimesh.Trimesh(verts, faces[face_region == region], process=False)
            sub.remove_unreferenced_vertices()
            out[f"{region}_{hemi}"] = sub
    return out


def volume_mesh(mask: np.ndarray, affine: np.ndarray, target_faces: int) -> trimesh.Trimesh | None:
    if mask.sum() < 20:
        return None
    padded = np.pad(mask.astype(np.float32), 1)
    verts, faces, _, _ = measure.marching_cubes(padded, level=0.5)
    verts = nib.affines.apply_affine(affine, verts - 1)  # undo padding, voxel -> mm
    mesh = trimesh.Trimesh(verts, faces[:, ::-1])  # flip winding so normals face out
    trimesh.smoothing.filter_taubin(mesh, iterations=25)
    if len(mesh.faces) > target_faces:
        mesh = mesh.simplify_quadric_decimation(face_count=target_faces)
    return mesh


def subcortical_meshes(fs_dir: Path) -> dict[str, trimesh.Trimesh]:
    img = nib.load(str(fs_dir / "mri/aseg.mgz"))
    data = np.asarray(img.dataobj).astype(np.int32)
    affine = img.header.get_vox2ras_tkr()  # same space as the surfaces
    out: dict[str, trimesh.Trimesh] = {}

    for hemi, regions in ASEG.items():
        for region, codes in regions.items():
            target = 6000 if region == "cerebellum" else 2500
            mesh = volume_mesh(np.isin(data, codes), affine, target)
            if mesh is not None:
                out[f"{region}_{hemi}"] = mesh

    # Brainstem: split into bands by height (superior-inferior, mm).
    stem_idx = np.argwhere(data == BRAINSTEM)
    stem_z = nib.affines.apply_affine(affine, stem_idx)[:, 2]
    for region, lo, hi in [("midbrain", PONS_TOP_Z, np.inf), ("pons", MEDULLA_TOP_Z, PONS_TOP_Z), ("medulla", -np.inf, MEDULLA_TOP_Z)]:
        band = np.zeros(data.shape, dtype=bool)
        sel = stem_idx[(stem_z >= lo) & (stem_z < hi)]
        band[tuple(sel.T)] = True
        mesh = volume_mesh(band, affine, 2500)
        if mesh is not None:
            out[f"{region}_mid"] = mesh
    return out


def marker_meshes() -> dict[str, trimesh.Trimesh]:
    out: dict[str, trimesh.Trimesh] = {}
    for region, specs in MARKERS.items():
        for (center, radii), hemi in zip(specs, ["lh", "rh"]):
            m = trimesh.creation.icosphere(subdivisions=3)
            m.apply_scale(radii)
            m.apply_translation(center)
            out[f"{region}_{hemi}"] = m
    return out


def to_three(meshes: dict[str, trimesh.Trimesh]) -> trimesh.Scene:
    """FreeSurfer RAS (mm) -> three.js (y up), centered, ~1 unit per 100 mm."""
    center = np.vstack([m.vertices for k, m in meshes.items() if not k.startswith(("medialwall", "cerebellum"))]).mean(0)
    scene = trimesh.Scene()
    for name, mesh in sorted(meshes.items()):
        v = (mesh.vertices - center) / 100.0
        m = trimesh.Trimesh(np.column_stack([v[:, 0], v[:, 2], -v[:, 1]]), mesh.faces, process=False)
        m.fix_normals()
        scene.add_geometry(m, geom_name=name, node_name=name)
    return scene


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    args = parser.parse_args()

    fs_dir = fetch_fs_files()
    meshes = {**cortex_meshes(fs_dir), **subcortical_meshes(fs_dir), **marker_meshes()}

    scene = to_three(meshes)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    scene.export(args.out)

    faces = sum(len(g.faces) for g in scene.geometry.values())
    print(f"wrote {args.out} ({os.path.getsize(args.out) / 1e6:.1f} MB, {len(meshes)} meshes, {faces:,} triangles)")
    for name in sorted(meshes):
        print(f"  {name:20s} {len(meshes[name].faces):>6,} faces")


if __name__ == "__main__":
    main()
