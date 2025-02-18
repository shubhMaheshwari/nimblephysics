dart_add_test("comprehensive" test_Building)
dart_add_test("comprehensive" test_Common)
dart_add_test("comprehensive" test_Concurrency)
dart_add_test("comprehensive" test_Constraint)
dart_add_test("comprehensive" test_Frames)
dart_add_test("comprehensive" test_NameManagement)
dart_add_test("comprehensive" test_Mappings)
dart_add_test("comprehensive" test_Trajectory)
dart_add_test("comprehensive" test_ParallelOps)
dart_add_test("comprehensive" test_DiffNode)
dart_add_test("comprehensive" test_Realtime)
dart_add_test("comprehensive" test_HalfCheetahRealtime)
dart_add_test("comprehensive" test_Server)
dart_add_test("comprehensive" test_Proto)
dart_add_test("comprehensive" test_SimpleFeatherstone)
dart_add_test("comprehensive" test_CollideGradient)
dart_add_test("comprehensive" test_GUIWebsocketServer)
dart_add_test("comprehensive" test_GUIRecording)
dart_add_test("comprehensive" test_CatapultTrajectory)
dart_add_test("comprehensive" test_AtlasTrajectory)
dart_add_test("comprehensive" test_HalfCheetahTrajectory)
dart_add_test("comprehensive" test_KR5Trajectory)
dart_add_test("comprehensive" test_SaddlepointEscape)
dart_add_test("comprehensive" test_DampGradient)
dart_add_test("comprehensive" test_SpringGradient)

# target_link_libraries(test_Gradients dart-collision-bullet)
# target_link_libraries(test_Gradients dart-collision-ode)
if(TARGET dart-optimizer-pagmo)
  dart_add_test("comprehensive" test_MultiObjectiveOptimization)
  target_link_libraries(test_MultiObjectiveOptimization dart-optimizer-pagmo)
endif()

dart_add_test("comprehensive" test_Raycast)

if(TARGET dart-collision-bullet)
  target_link_libraries(test_Raycast dart-collision-bullet)
endif()

if(TARGET dart-utils)
  dart_add_test("comprehensive" test_Collision)
  target_link_libraries(test_Collision dart-utils)

  if(TARGET dart-collision-bullet)
    target_link_libraries(test_Collision dart-collision-bullet)
  endif()

  if(TARGET dart-collision-ode)
    target_link_libraries(test_Collision dart-collision-ode)
  endif()

  dart_add_test("comprehensive" test_DifferentialDynamics)
  target_link_libraries(test_DifferentialDynamics dart-utils)

  dart_add_test("comprehensive" test_Dynamics)
  target_link_libraries(test_Dynamics dart-utils)

  dart_add_test("comprehensive" test_Joints)
  target_link_libraries(test_Joints dart-utils)

  dart_add_test("comprehensive" test_Skeleton)
  target_link_libraries(test_Skeleton dart-utils)

  dart_add_test("comprehensive" test_MetaSkeleton)
  target_link_libraries(test_MetaSkeleton dart-utils)

  dart_add_test("comprehensive" test_SoftDynamics)
  target_link_libraries(test_SoftDynamics dart-utils)

  dart_add_test("comprehensive" test_Cartpole)

  dart_add_test("comprehensive" test_World)
  target_link_libraries(test_World dart-utils)

  if(TARGET dart-collision-bullet)
    target_link_libraries(test_World dart-collision-bullet)
  endif()

  if(TARGET dart-utils-urdf)
    dart_add_test("comprehensive" test_ForwardKinematics)
    target_link_libraries(test_ForwardKinematics dart-utils-urdf)
    target_link_libraries(test_GUIWebsocketServer dart-utils-urdf)
    target_link_libraries(test_GUIRecording dart-utils-urdf)
    target_link_libraries(test_AtlasTrajectory dart-utils)
    target_link_libraries(test_AtlasTrajectory dart-utils-urdf)
    target_link_libraries(test_HalfCheetahTrajectory dart-utils)
    target_link_libraries(test_HalfCheetahTrajectory dart-utils-urdf)
    target_link_libraries(test_HalfCheetahRealtime dart-utils)
    target_link_libraries(test_HalfCheetahRealtime dart-utils-urdf)
    target_link_libraries(test_KR5Trajectory dart-utils)
    target_link_libraries(test_KR5Trajectory dart-utils-urdf)
    target_link_libraries(test_Cartpole dart-utils)
    target_link_libraries(test_Cartpole dart-utils-urdf)

    dart_add_test("comprehensive" test_Gradients)
    target_link_libraries(test_Gradients dart-utils-urdf)

    dart_add_test("comprehensive" test_ParallelPosAndVel)
    target_link_libraries(test_ParallelPosAndVel dart-utils-urdf)
  endif()
endif()

dart_format_add(
  test_DifferentialDynamics.cpp
  test_MultiObjectiveOptimization.cpp
  test_Raycast.cpp
)
