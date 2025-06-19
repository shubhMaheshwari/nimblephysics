import nimblephysics_libs._nimblephysics.utils.UniversalLoader
import typing
import nimblephysics_libs._nimblephysics.dynamics
import nimblephysics_libs._nimblephysics.simulation
import numpy
import numpy.typing
_Shape = typing.Tuple[int, ...]

__all__ = [
    "loadMeshShape",
    "loadSkeleton",
    "loadWorld"
]


def loadMeshShape(path: str) -> nimblephysics_libs._nimblephysics.dynamics.MeshShape:
    pass
def loadSkeleton(world: nimblephysics_libs._nimblephysics.simulation.World, path: str, basePosition: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"], baseEulerXYZ: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"]) -> nimblephysics_libs._nimblephysics.dynamics.Skeleton:
    pass
def loadWorld(path: str) -> nimblephysics_libs._nimblephysics.simulation.World:
    pass
