![Stanford Nimble Logo](https://nimblephysics.org/README/README_Splash.svg)

[![Tests](https://github.com/nimblephysics/nimblephysics/actions/workflows/ci_docker.yml/badge.svg)](https://github.com/nimblephysics/nimblephysics/actions/workflows/ci_docker.yml)

# Stanford Nimble

`pip3 install nimblephysics`

** BETA SOFTWARE **

[Read our docs](http://www.nimblephysics.org/docs) and [the paper](https://arxiv.org/abs/2103.16021).

Use physics as a non-linearity in your neural network. A single timestep, `nimble.timestep(state, controls)`, is a valid PyTorch function.

![Forward pass illustration](https://nimblephysics.org/README/README_DataFlow_Fwd.svg)

We support an analytical backwards pass, that works even through contact and friction.

![Backpropagation illustration](https://nimblephysics.org/README/README_DataFlow_Back.svg)

It's as easy as:

```python
from nimble import timestep

# Everything is a PyTorch Tensor, and this is differentiable!!
next_state = timestep(world, current_state, control_forces)
```

Nimble started life as a fork of the popular DART physics engine, with analytical gradients and a PyTorch binding. We've worked hard to maintain as much backwards compatability as we can, so many simulations that worked in DART should translate directly to Nimble.

Check out our [website](http://www.nimblephysics.org) for more information.

### Installing on Arm64 Macs (M1, M2, etc)

We don't yet publish Arm64 binaries to PyPI from our CI system, so you may not be able to `pip3 install nimblephysics` from a new Arm64 Mac.
We will endeavor to manually push binaries occassionally, but until GitHub Actions supports using Arm64 Mac runners, that may run a bit behind.

Currently, the pre-built Arm64 binaries are ONLY AVAILABLE ON PYTHON 3.9. So if you create a virtual environment with Python 3.9, and then `pip3 install nimblephysics`, that should work.

If you really need another Python version for some reason, the solution is to clone this repo, then run
- `ci/mac/install_dependencies.sh`
- `ci/mac/manually_build_arm64_wheels.sh`
That will install the dependencies you need, and then build and install the Python package. Please create Issues if you run into problems, and we'll do our best to fix them.


# Developer info


### Making changes or creating new python bindings

**To make nimblephysics compatible with BIGE** make the following chagnes:** 

1. Install nimblephysics

	```
	pip install nimblephysics
	```

2. Look at `ci/install/manylinux.sh`  to install all the modules properly. 

3. Build c++ binding 
	```
	mkdir build
	cmake .. -DDART_BUILD_SHARED_LIBS=ON -DBUILD_SHARED_LIBS=ON  \
			-DDART_VERBOSE=ON \
			-DCMAKE_BUILD_TYPE=Release \
			-DBUILD_PYTHON=ON 
	make -j 4
	```

4. Copy binding to location where nimblephysics is installed, see `setup.py` and `generate_pyi_stubs.sh`

	```
	cp <nimblephysics-dir>/build/python/_nimblephysics/_nimblephysics.so /<python-env>/lib/python3.8/site-packages/nimblephysics_libs // Copy .so python binding file. 
	cd build/python/_nimblephysics
	PYTHONPATH=:$PWD pybind11-stubgen --no-setup-py -o stubs _nimblephysics 
	touch stubs/_nimblephysics-stubs/py.typed
	mv stubs/_nimblephysics-stubs/__init__.pyi stubs/_nimblephysics-stubs/_nimblephysics.pyi
	find stubs/_nimblephysics-stubs -type f | xargs sed -i 's/_nimblephysics/nimblephysics_libs\._nimblephysics/g'
	```

### To create new python-javascript workflow 

NimblePhysics works by creating python binding to make python work with C++ / dart. The it uses probobufs to interact with the frontend. To create a new workflow

1. Update `data/proto/GUI.proto`
	- Add new element in Command, last was collapse container = 40
	- Add message to share the element
	- run cmake command again compile the cpp files in dart/proto using the updated .proto files  

2. Update `GUIStateMachine.hpp`
	- Create struct for new frontend element. 
	- Create new map/list to store the struct
	- Declare createNewElement, encodeNewElement functions 

3. Update `GUIStateMachine.cpp`
	- Define createNewElement, encodeNewElement functions
	- Update getCurrentStateAsJson

4. Update `python/_nimblephysics/server/GUIWebsocketServer.cpp` with new functions that are accessible to python 


5. Update javascript
	- Add new else if conditions in `HandleCommand` function of `NimbleView.ts` or `NimbleRemvote.ts` for normal or interactive HTML elements respectively. 
	- compile 

6. If interactive element send 
	- Update mServer->message in `GUIWebSocketServer::serve`


### Change logs: 
1. (assimp version should be <= 5.0.0)
	- Warning [MeshShape.cpp:493] [MeshShape::loadMesh] Failed loading mesh 'Geometry/little_proximal_lvs.ply' with ASSIMP error 'basic_string::erase: __pos (which is 18446744073709551615) > this->size() (which is 34)'.
	- Try reinstalling assimp version 5.0.0 (see ci/manylinux/ubuntu.sh)


2. python binding could not find symbol _ZdasdaRootVeclocity
	- Replaced  `constexpr` with `const` for `Joint::ActuatorType Joint::VELOCITY` in `dart/dynamics/Joint.{hpp,cpp}`