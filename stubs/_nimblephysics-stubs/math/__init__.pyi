"""Bindings for Eigen geometric types."""
import nimblephysics_libs._nimblephysics.math
import typing
import AxisOrder
import nimblephysics_libs._nimblephysics.dynamics
import numpy
import numpy.typing
_Shape = typing.Tuple[int, ...]

__all__ = [
    "AdR",
    "AdT",
    "AngleAxis",
    "BoundingBox",
    "GraphFlowDiscretizer",
    "Isometry3",
    "MultivariateGaussian",
    "ParticlePath",
    "PolynomialFitter",
    "Quaternion",
    "Random",
    "RelativeFilter",
    "dAdInvT",
    "dAdT",
    "distancePointToConvexHull2D",
    "distancePointToConvexHullProjectedTo2D",
    "eulerXYXToMatrix",
    "eulerXYZToMatrix",
    "eulerXZXToMatrix",
    "eulerXZYToMatrix",
    "eulerYXYToMatrix",
    "eulerYXZToMatrix",
    "eulerYZXToMatrix",
    "eulerYZYToMatrix",
    "eulerZXYToMatrix",
    "eulerZXZToMatrix",
    "eulerZYXToMatrix",
    "eulerZYZToMatrix",
    "expAngular",
    "expMap",
    "expMapJac",
    "expMapRot",
    "expToQuat",
    "leftMultiplyInFreeJointSpace",
    "logMap",
    "matrixToEulerXYX",
    "matrixToEulerXYZ",
    "matrixToEulerXZY",
    "matrixToEulerYXZ",
    "matrixToEulerYZX",
    "matrixToEulerZXY",
    "matrixToEulerZYX",
    "quatToExp",
    "rightMultiplyInFreeJointSpace",
    "roundEulerAnglesToNearest",
    "transformBy",
    "verifyRotation",
    "verifyTransform"
]


class AngleAxis():
    """
    Bindings for Eigen::AngleAxis<>.
    """
    @staticmethod
    def Identity() -> AngleAxis: ...
    @typing.overload
    def __init__(self) -> None: ...
    @typing.overload
    def __init__(self, angle: float, axis: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"]) -> None: ...
    @typing.overload
    def __init__(self, other: AngleAxis) -> None: ...
    @typing.overload
    def __init__(self, quaternion: Quaternion) -> None: ...
    @typing.overload
    def __init__(self, rotation: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 3]"]) -> None: ...
    def __str__(self) -> str: ...
    def angle(self) -> float: ...
    def axis(self) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 1]"]: ...
    def inverse(self) -> AngleAxis: ...
    def multiply(self, arg0: AngleAxis) -> Quaternion: ...
    def quaternion(self) -> Quaternion: ...
    def rotation(self) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 3]"]: ...
    def set_angle(self, angle: float) -> None: ...
    def set_axis(self, axis: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"]) -> None: ...
    def set_quaternion(self, arg0: Quaternion) -> None: ...
    def set_rotation(self, arg0: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 3]"]) -> None: ...
    def to_rotation_matrix(self) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 3]"]: ...
    pass
class BoundingBox():
    @typing.overload
    def __init__(self) -> None: ...
    @typing.overload
    def __init__(self, min: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"], max: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"]) -> None: ...
    def computeCenter(self) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 1]"]: ...
    def computeFullExtents(self) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 1]"]: ...
    def computeHalfExtents(self) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 1]"]: ...
    def getMax(self) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 1]"]: ...
    def getMin(self) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 1]"]: ...
    pass
class GraphFlowDiscretizer():
    def __init__(self, numNodes: int, arcs: list[tuple[int, int]], nodeAttachedToSink: list[bool]) -> None: ...
    def cleanUpArcRates(self, energyLevels: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[m, n]"], arcRates: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[m, n]"]) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[m, n]"]: 
        """
        This will find the least-squares closest rates of transfer across the arcs to end up with the energy levels at each node we got over time. The idea here is that arc rates may not perfectly reflect the observed changes in energy levels.
        """
    def discretize(self, maxSimultaneousParticles: int, energyLevels: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[m, n]"], arcRates: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[m, n]"]) -> list[ParticlePath]: 
        """
        This will attempt to create a set of ParticlePath objects that map the recorded graph node levels and flows as closely as possible. The particles can be created and destroyed within the arcs.
        """
    pass
class Isometry3():
    @staticmethod
    def Identity() -> Isometry3: ...
    @typing.overload
    def __init__(self) -> None: ...
    @typing.overload
    def __init__(self, matrix: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[4, 4]"]) -> None: ...
    @typing.overload
    def __init__(self, other: Isometry3) -> None: ...
    @typing.overload
    def __init__(self, quaternion: Quaternion, translation: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"]) -> None: ...
    @typing.overload
    def __init__(self, rotation: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 3]"], translation: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"]) -> None: ...
    def __str__(self) -> str: ...
    def inverse(self) -> Isometry3: ...
    def matrix(self) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[4, 4]"]: ...
    @typing.overload
    def multiply(self, other: Isometry3) -> Isometry3: ...
    @typing.overload
    def multiply(self, position: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"]) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 1]"]: ...
    def pretranslate(self, other: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"]) -> None: ...
    def quaternion(self) -> Quaternion: ...
    def rotation(self) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 3]"]: ...
    def set_matrix(self, arg0: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[4, 4]"]) -> None: ...
    def set_quaternion(self, arg0: Quaternion) -> None: ...
    def set_rotation(self, arg0: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 3]"]) -> None: ...
    def set_translation(self, arg0: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"]) -> None: ...
    def translate(self, other: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"]) -> None: ...
    def translation(self) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 1]"]: ...
    pass
class MultivariateGaussian():
    def __init__(self, variables: list[str], mu: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[m, 1]"], cov: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[m, n]"]) -> None: ...
    def computeLogPDF(self, values: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[m, 1]"], normalized: bool = True) -> float: ...
    def computeLogPDFGrad(self, x: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[m, 1]"]) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[m, 1]"]: ...
    def computePDF(self, values: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[m, 1]"]) -> float: ...
    def condition(self, observedValues: dict[str, float]) -> MultivariateGaussian: ...
    def convertFromMap(self, values: dict[str, float]) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[m, 1]"]: ...
    def convertToMap(self, values: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[m, 1]"]) -> dict[str, float]: ...
    def debugToStdout(self) -> None: ...
    def getCov(self) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[m, n]"]: ...
    def getCovSubset(self, rowIndices: list[int], colIndices: list[int]) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[m, n]"]: ...
    def getLogNormalizationConstant(self) -> float: ...
    def getMean(self, variable: str) -> float: ...
    def getMu(self) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[m, 1]"]: ...
    def getMuSubset(self, indices: list[int]) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[m, 1]"]: ...
    def getObservedIndices(self, observedValues: dict[str, float]) -> list[int]: ...
    def getUnobservedIndices(self, observedValues: dict[str, float]) -> list[int]: ...
    def getVariableNameAtIndex(self, i: int) -> str: ...
    def getVariableNames(self) -> list[str]: ...
    @staticmethod
    def loadFromCSV(file: str, columns: list[str], units: float = 1.0) -> MultivariateGaussian: ...
    pass
class ParticlePath():
    @property
    def energyValue(self) -> float:
        """
        :type: float
        """
    @energyValue.setter
    def energyValue(self, arg0: float) -> None:
        pass
    @property
    def nodeHistory(self) -> list[int]:
        """
        :type: list[int]
        """
    @nodeHistory.setter
    def nodeHistory(self, arg0: list[int]) -> None:
        pass
    @property
    def startTime(self) -> int:
        """
        :type: int
        """
    @startTime.setter
    def startTime(self, arg0: int) -> None:
        pass
    pass
class PolynomialFitter():
    def __init__(self, timesteps: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[m, 1]"], order: int) -> None: ...
    def calcCoeffs(self, values: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[m, 1]"]) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[m, 1]"]: ...
    def projectPosVelAccAtTime(self, timestep: float, pastValues: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[m, 1]"]) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 1]"]: ...
    pass
class Quaternion():
    """
    Provides a unit quaternion binding of Eigen::Quaternion<>.
    """
    @staticmethod
    def Identity() -> Quaternion: ...
    @typing.overload
    def __init__(self) -> None: ...
    @typing.overload
    def __init__(self, other: Quaternion) -> None: ...
    @typing.overload
    def __init__(self, rotation: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 3]"]) -> None: ...
    @typing.overload
    def __init__(self, w: float, x: float, y: float, z: float) -> None: ...
    @typing.overload
    def __init__(self, wxyz: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[4, 1]"]) -> None: ...
    def __str__(self) -> str: ...
    def conjugate(self) -> Quaternion: ...
    def inverse(self) -> Quaternion: ...
    @typing.overload
    def multiply(self, arg0: Quaternion) -> Quaternion: ...
    @typing.overload
    def multiply(self, position: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"]) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 1]"]: ...
    def rotation(self) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 3]"]: ...
    def set_rotation(self, arg0: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 3]"]) -> None: ...
    @typing.overload
    def set_wxyz(self, w: float, x: float, y: float, z: float) -> None: ...
    @typing.overload
    def set_wxyz(self, wxyz: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[4, 1]"]) -> None: ...
    def to_rotation_matrix(self) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 3]"]: ...
    def w(self) -> float: ...
    def wxyz(self) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[4, 1]"]: ...
    def x(self) -> float: ...
    def xyz(self) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 1]"]: ...
    def y(self) -> float: ...
    def z(self) -> float: ...
    pass
class Random():
    def __init__(self) -> None: ...
    @staticmethod
    def getSeed() -> int: ...
    @staticmethod
    def setSeed(seed: int) -> None: ...
    @staticmethod
    def uniform(min: float, max: float) -> float: ...
    pass
class RelativeFilter():
    def __init__(self, acc_std: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"] = array([0.05, 0.05, 0.05]), gyro_std: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"] = array([0.05, 0.05, 0.05]), mag_std: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"] = array([0.05, 0.05, 0.05])) -> None: ...
    def get_H_jacobian(self, R_wp: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 3]"], R_wc: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 3]"], acc_jc_p: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"], acc_jc_c: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"], mag_jc_p: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"], mag_jc_c: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"]) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[m, n]"]: 
        """
        Compute the Jacobian of the measurement function h.
        """
    def get_M_jacobian(self, R_wp: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 3]"], R_wc: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 3]"], update: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[6, 1]"] = array([0., 0., 0., 0., 0., 0.])) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[m, n]"]: 
        """
        Compute the Jacobian of the measurement function for sensor noise.
        """
    def get_R_pc(self) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 3]"]: 
        """
        Get the rotation matrix representing the relative rotation between parent and child.
        """
    def get_h(self, R_wp: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 3]"], R_wc: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 3]"], acc_jc_p: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"], acc_jc_c: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"], mag_jc_p: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"], mag_jc_c: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"], perturbation: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[6, 1]"] = array([0., 0., 0., 0., 0., 0.])) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[m, 1]"]: 
        """
        Compute the measurement function h with optional perturbations.
        """
    def get_q_pc(self) -> Quaternion: 
        """
        Get the quaternion representing the relative rotation between parent and child.
        """
    def set_qs(self, q_wp: Quaternion, q_wc: Quaternion) -> None: 
        """
        Set the quaternions for parent and child.
        """
    @staticmethod
    def skew_symmetric(v: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"]) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 3]"]: 
        """
        Compute the skew-symmetric matrix for a given 3D vector.
        """
    def update(self, gyro_p: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"], gyro_c: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"], acc_jc_p: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"], acc_jc_c: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"], mag_p: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"], mag_c: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"], dt: float) -> None: 
        """
        Update the filter with new sensor readings and timestep.
        """
    @property
    def Q(self) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[m, n]"]:
        """
        Covariance matrix for gyro sensor noise.

        :type: typing.Annotated[numpy.typing.NDArray[numpy.float64], "[m, n]"]
        """
    @property
    def R(self) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[m, n]"]:
        """
        Covariance matrix for accelerometer and magnetometer sensor noise.

        :type: typing.Annotated[numpy.typing.NDArray[numpy.float64], "[m, n]"]
        """
    pass
def AdR(R: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 3]"], S: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[6, 1]"]) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[6, 1]"]:
    pass
def AdT(R: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 3]"], p: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"], S: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[6, 1]"]) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[6, 1]"]:
    pass
def dAdInvT(R: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 3]"], p: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"], S: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[6, 1]"]) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[6, 1]"]:
    pass
def dAdT(R: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 3]"], p: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"], S: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[6, 1]"]) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[6, 1]"]:
    pass
def distancePointToConvexHull2D(P: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[2, 1]"], points: list[typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[2, 1]"]]) -> float:
    pass
def distancePointToConvexHullProjectedTo2D(P: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"], points: list[typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"]], normal: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"] = array([0., 1., 0.])) -> float:
    pass
def eulerXYXToMatrix(angle: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"]) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 3]"]:
    pass
def eulerXYZToMatrix(angle: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"]) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 3]"]:
    pass
def eulerXZXToMatrix(angle: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"]) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 3]"]:
    pass
def eulerXZYToMatrix(angle: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"]) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 3]"]:
    pass
def eulerYXYToMatrix(angle: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"]) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 3]"]:
    pass
def eulerYXZToMatrix(angle: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"]) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 3]"]:
    pass
def eulerYZXToMatrix(angle: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"]) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 3]"]:
    pass
def eulerYZYToMatrix(angle: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"]) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 3]"]:
    pass
def eulerZXYToMatrix(angle: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"]) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 3]"]:
    pass
def eulerZXZToMatrix(angle: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"]) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 3]"]:
    pass
def eulerZYXToMatrix(angle: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"]) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 3]"]:
    pass
def eulerZYZToMatrix(angle: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"]) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 3]"]:
    pass
def expAngular(s: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"]) -> Isometry3:
    pass
def expMap(S: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[6, 1]"]) -> Isometry3:
    pass
def expMapJac(expmap: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"]) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 3]"]:
    pass
def expMapRot(expmap: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"]) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 3]"]:
    pass
def expToQuat(v: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"]) -> Quaternion:
    pass
def leftMultiplyInFreeJointSpace(R: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 3]"], p: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"], S: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[6, 1]"]) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[6, 1]"]:
    pass
def logMap(S: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 3]"]) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 1]"]:
    pass
def matrixToEulerXYX(R: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 3]"]) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 1]"]:
    pass
def matrixToEulerXYZ(R: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 3]"]) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 1]"]:
    pass
def matrixToEulerXZY(R: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 3]"]) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 1]"]:
    pass
def matrixToEulerYXZ(R: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 3]"]) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 1]"]:
    pass
def matrixToEulerYZX(R: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 3]"]) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 1]"]:
    pass
def matrixToEulerZXY(R: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 3]"]) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 1]"]:
    pass
def matrixToEulerZYX(R: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 3]"]) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 1]"]:
    pass
def quatToExp(q: Quaternion) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 1]"]:
    pass
def rightMultiplyInFreeJointSpace(R: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 3]"], p: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"], S: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[6, 1]"]) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[6, 1]"]:
    pass
def roundEulerAnglesToNearest(angle: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"], previousAngle: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"], axisOrder: nimblephysics_libs._nimblephysics.dynamics.AxisOrder = AxisOrder.XYZ) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 1]"]:
    pass
def transformBy(T: Isometry3, p: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 1]"]) -> typing.Annotated[numpy.typing.NDArray[numpy.float64], "[3, 1]"]:
    pass
def verifyRotation(R: typing.Annotated[numpy.typing.ArrayLike, numpy.float64, "[3, 3]"]) -> bool:
    pass
def verifyTransform(T: Isometry3) -> bool:
    pass
