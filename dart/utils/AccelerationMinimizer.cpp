#include "AccelerationMinimizer.hpp"

#include <iostream>

// #include <Eigen/Core>
// #include <Eigen/Dense>
#include <Eigen/IterativeLinearSolvers>
// #include <unsupported/Eigen/IterativeSolvers>

#include "dart/math/MathTypes.hpp"

namespace dart {
namespace utils {

/**
 * Create (and pre-factor) a smoother that can remove the "jerk" from a time
 * series of data.
 *
 * The alpha value will determine how much smoothing to apply. A value of 0
 * corresponds to no smoothing.
 */
AccelerationMinimizer::AccelerationMinimizer(
    int timesteps,
    s_t smoothingWeight,
    s_t regularizationWeight,
    s_t startPositionZeroWeight,
    s_t endPositionZeroWeight,
    s_t startVelocityZeroWeight,
    s_t endVelocityZeroWeight,
    int numIterations)
  : mTimesteps(timesteps),
    mSmoothingWeight(smoothingWeight),
    mRegularizationWeight(regularizationWeight),
    mStartPositionZeroWeight(startPositionZeroWeight * timesteps),
    mEndPositionZeroWeight(endPositionZeroWeight * timesteps),
    mStartVelocityZeroWeight(startVelocityZeroWeight * timesteps),
    mEndVelocityZeroWeight(endVelocityZeroWeight * timesteps),
    mNumIterations(numIterations),
    mNumIterationsBackoff(6),
    mDebugIterationBackoff(false),
    mConvergenceTolerance(1e-10)
{
  if (mTimesteps < 3)
  {
    std::cout << "AccelerationMinimizer requires at least 3 timesteps to work."
              << std::endl;
    throw std::runtime_error(
        "AccelerationMinimizer requires at least 3 timesteps to work.");
  }
  Eigen::Vector3s stamp;
  stamp << -1, 2, -1;
  stamp *= mSmoothingWeight;

  typedef Eigen::Triplet<s_t> T;
  std::vector<T> tripletList;
  const int accTimesteps = mTimesteps - 2;
  for (int i = 0; i < accTimesteps; i++)
  {
    for (int j = 0; j < 3; j++)
    {
      tripletList.push_back(T(i, i + j, stamp(j)));
    }
  }
  // Add start velocity zero constraint
  tripletList.push_back(T(accTimesteps, 0, mStartVelocityZeroWeight));
  tripletList.push_back(T(accTimesteps, 1, -mStartVelocityZeroWeight));
  // Add end velocity zero constraint
  tripletList.push_back(
      T(accTimesteps + 1, mTimesteps - 2, mEndVelocityZeroWeight));
  tripletList.push_back(
      T(accTimesteps + 1, mTimesteps - 1, -mEndVelocityZeroWeight));
  // Add start position zero constraint
  tripletList.push_back(T(accTimesteps + 2, 0, mStartPositionZeroWeight));
  // Add end position zero constraint
  tripletList.push_back(
      T(accTimesteps + 3, mTimesteps - 1, mEndPositionZeroWeight));
  for (int i = 0; i < mTimesteps; i++)
  {
    tripletList.push_back(T(accTimesteps + 4 + i, i, mRegularizationWeight));
  }
  mB_sparse
      = Eigen::SparseMatrix<s_t>(accTimesteps + 4 + mTimesteps, mTimesteps);
  mB_sparse.setFromTriplets(tripletList.begin(), tripletList.end());
  mB_sparse.makeCompressed();
}

Eigen::VectorXs AccelerationMinimizer::minimize(Eigen::VectorXs series)
{
  const int accTimesteps = mTimesteps - 2;
  Eigen::VectorXs b = Eigen::VectorXs(accTimesteps + 4 + mTimesteps);
  b.segment(0, accTimesteps + 4).setZero();
  b.segment(accTimesteps + 4, mTimesteps) = series * mRegularizationWeight;

  Eigen::VectorXs x = series;

  int iterations = mNumIterations;
  for (int i = 0; i < mNumIterationsBackoff; i++)
  {
    Eigen::LeastSquaresConjugateGradient<Eigen::SparseMatrix<s_t>> solver;
    solver.compute(mB_sparse);
    solver.setTolerance(mConvergenceTolerance);
    solver.setMaxIterations(iterations);
    x = solver.solveWithGuess(b, series);
    // Check convergence
    if (solver.info() == Eigen::Success)
    {
      // Converged
      break;
    }
    else
    {
      if (mDebugIterationBackoff)
      {
        std::cout
            << "[AccelerationMinimizer] LeastSquaresConjugateGradient did "
               "not converge in "
            << iterations << ", with error " << solver.error()
            << " so doubling iteration count and trying again." << std::endl;
      }
      iterations *= 2;
    }
  }

  return x;
}

void AccelerationMinimizer::setDebugIterationBackoff(bool debug)
{
  mDebugIterationBackoff = debug;
}

void AccelerationMinimizer::setNumIterationsBackoff(int numIterations)
{
  mNumIterationsBackoff = numIterations;
}

void AccelerationMinimizer::setConvergenceTolerance(s_t tolerance)
{
  mConvergenceTolerance = tolerance;
}

} // namespace utils
} // namespace dart