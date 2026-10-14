"""Checks for Kaerimichi. Run: python test_kaerimichi.py (or pytest).

The wiring checks always run; the gtfs.js logic test (test_gtfs.mjs) runs when Node.js is installed.
MV2 of Munim, Inc. - MIT license.
"""
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent


def read(name):
    return (HERE / name).read_text(encoding="utf-8")


def test_app_imports_exist_in_gtfs():
    app, gtfs = read("app.js"), read("gtfs.js")
    m = re.search(r"import \{([^}]*)\} from './gtfs.js'", app)
    assert m, "app.js does not import from ./gtfs.js"
    exported = set(re.findall(r"export (?:async )?function (\w+)", gtfs))
    for name in (n.strip() for n in m.group(1).split(",")):
        assert name in exported, "gtfs.js does not export " + name


def test_app_element_ids_exist_in_html():
    app, html = read("app.js"), read("index.html")
    ids = set(re.findall(r'id="([\w-]+)"', html))
    for i in set(re.findall(r"\$\('#([\w-]+)", app)):
        assert i in ids, "index.html has no element #" + i


def test_version_constant():
    assert re.search(r"const VERSION = '\d+\.\d+'", read("app.js"))


def test_gtfs_logic_with_node():
    node = shutil.which("node")
    if not node:
        return
    with tempfile.TemporaryDirectory() as d:
        for f in ("gtfs.js", "test_gtfs.mjs"):
            shutil.copy(HERE / f, d)
        Path(d, "package.json").write_text('{"type": "module"}', encoding="utf-8")
        r = subprocess.run([node, "test_gtfs.mjs"], cwd=d, capture_output=True,
                           text=True, encoding="utf-8", errors="replace", timeout=120)
        assert r.returncode == 0, r.stdout + r.stderr


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test_") and callable(fn):
            fn()
            print("ok", name)
