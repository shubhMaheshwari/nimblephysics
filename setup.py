import os
import re
import sys
import platform
import subprocess
import shutil
from pathlib import Path

from setuptools import setup, Extension, find_packages
from setuptools.command.build_ext import build_ext
from distutils.version import LooseVersion


class CMakeExtension(Extension):
    def __init__(self, name, target, sourcedir=''):
        Extension.__init__(self, name, sources=[])
        self.sourcedir = os.path.abspath(sourcedir)
        self.target = target


class CMakeBuild(build_ext):
    def run(self):
        try:
            out = subprocess.check_output(['cmake', '--version'])
        except OSError:
            raise RuntimeError("CMake must be installed to build the following extensions: " +
                               ", ".join(e.name for e in self.extensions))

        if platform.system() == "Windows":
            cmake_version = LooseVersion(re.search(r'version\s*([\d.]+)', out.decode()).group(1))
            if cmake_version < '3.1.0':
                raise RuntimeError("CMake >= 3.1.0 is required on Windows")

        for ext in self.extensions:
            self.build_extension(ext)

    def build_extension(self, ext):
        extdir = os.path.abspath(os.path.dirname(self.get_ext_fullpath(ext.name)))

        # required for auto-detection of auxiliary "native" libs
        if not extdir.endswith(os.path.sep):
            extdir += os.path.sep

        cmake_args = ['-DCMAKE_LIBRARY_OUTPUT_DIRECTORY=' + extdir,
                      '-DPYTHON_EXECUTABLE=' + sys.executable,
                      '-DDART_BUILD_SHARED_LIBS=ON',
                      '-DDART_VERBOSE=ON',
                      '-DCMAKE_BUILD_TYPE=Release',
                      '-DBUILD_PYTHON=ON',
                      '-DCMAKE_CXX_FLAGS=-Wno-maybe-uninitialized -Wno-error=maybe-uninitialized']

        cfg = 'Debug' if self.debug else 'Release'
        build_args = ['--config', cfg]

        if platform.system() == "Windows":
            cmake_args += ['-DCMAKE_LIBRARY_OUTPUT_DIRECTORY_{}={}'.format(cfg.upper(), extdir)]
            if sys.maxsize > 2**32:
                cmake_args += ['-A', 'x64']
            build_args += ['--', '/m']
        else:
            cmake_args += ['-DCMAKE_BUILD_TYPE=' + cfg]
            build_args += ['--', '-j4']

        env = os.environ.copy()
        env['CXXFLAGS'] = '{} -DVERSION_INFO=\\"{}\\"'.format(env.get('CXXFLAGS', ''),
                                                              self.distribution.get_version())

        if not os.path.exists(self.build_temp):
            os.makedirs(self.build_temp)

        subprocess.check_call(['cmake', ext.sourcedir] + cmake_args, cwd=self.build_temp, env=env)
        subprocess.check_call(['cmake', '--build', '.', '--target', ext.target] + build_args,
                              cwd=self.build_temp, env=env)

        # Regenerate the stubs
        dir_path = os.path.dirname(os.path.realpath(__file__))
        gen_stubs_script = os.path.join(dir_path, 'generate_pyi_stubs.sh')
        
        if os.path.exists(gen_stubs_script):
            print("🔧 Running generate_pyi_stubs.sh...")
            subprocess.check_call([gen_stubs_script, extdir], cwd=dir_path, env=env)
        else:
            print("🔧 Generating stubs manually...")
            # Manual stub generation since script might not exist
            python_build_dir = os.path.join(self.build_temp, 'python', '_nimblephysics')
            
            if os.path.exists(python_build_dir):
                # Install pybind11-stubgen if not already installed
                try:
                    import pybind11_stubgen
                except ImportError:
                    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'pybind11-stubgen'])
                
                # Generate stubs
                old_cwd = os.getcwd()
                os.chdir(python_build_dir)
                
                env_copy = env.copy()
                env_copy['PYTHONPATH'] = f":{os.getcwd()}"
                
                subprocess.check_call([
                    sys.executable, '-m', 'pybind11_stubgen', '-o', 'stubs', '_nimblephysics'
                ], env=env_copy)
                
                # Process stubs
                stubs_dir = os.path.join(python_build_dir, 'stubs', '_nimblephysics-stubs')
                if os.path.exists(stubs_dir):
                    # Touch py.typed
                    Path(os.path.join(stubs_dir, 'py.typed')).touch()
                    
                    # Rename __init__.pyi to _nimblephysics.pyi
                    init_pyi = os.path.join(stubs_dir, '__init__.pyi')
                    nimble_pyi = os.path.join(stubs_dir, '_nimblephysics.pyi')
                    if os.path.exists(init_pyi):
                        shutil.move(init_pyi, nimble_pyi)
                    
                    # Fix import paths
                    for root, dirs, files in os.walk(stubs_dir):
                        for file in files:
                            if file.endswith('.pyi'):
                                file_path = os.path.join(root, file)
                                with open(file_path, 'r') as f:
                                    content = f.read()
                                content = content.replace('_nimblephysics', 'nimblephysics_libs._nimblephysics')
                                with open(file_path, 'w') as f:
                                    f.write(content)
                
                os.chdir(old_cwd)

        stubs_home = os.path.join(dir_path, 'stubs', '_nimblephysics-stubs')
        
        # If manual stub generation was used, copy from build directory
        if not os.path.exists(stubs_home):
            python_build_dir = os.path.join(self.build_temp, 'python', '_nimblephysics')
            build_stubs_dir = os.path.join(python_build_dir, 'stubs', '_nimblephysics-stubs')
            if os.path.exists(build_stubs_dir):
                os.makedirs(os.path.dirname(stubs_home), exist_ok=True)
                shutil.copytree(build_stubs_dir, stubs_home)

        if os.path.exists(stubs_home):
            stub_files = os.listdir(stubs_home)
            for file_name in stub_files:
                if os.path.isdir(os.path.join(stubs_home, file_name)):
                    if os.path.exists(os.path.join(extdir, file_name)):
                        shutil.rmtree(os.path.join(extdir, file_name))
                    shutil.copytree(os.path.join(stubs_home, file_name),
                                    os.path.join(extdir, file_name))
                elif os.path.isfile(os.path.join(stubs_home, file_name)):
                    if os.path.exists(os.path.join(extdir, file_name)):
                        os.remove(os.path.join(extdir, file_name))
                    shutil.copy(os.path.join(stubs_home, file_name),
                                os.path.join(extdir, file_name))

        # Copy the correct .so file from build/python/_nimblephysics.so
        so_source = os.path.join(self.build_temp, 'python', '_nimblephysics.so')
        so_dest = os.path.join(extdir, '_nimblephysics.so')
        
        print(f"🔧 Copying .so file from: {so_source}")
        print(f"   to: {so_dest}")
        
        if os.path.exists(so_source):
            shutil.copy(so_source, so_dest)
            print("✅ .so file copied successfully!")
        else:
            print(f"⚠️ Warning: .so file not found at {so_source}")
            # Try alternative locations
            alt_locations = [
                os.path.join(self.build_temp, '_nimblephysics.so'),
                os.path.join(self.build_temp, 'python', '_nimblephysics', '_nimblephysics.so')
            ]
            for alt_loc in alt_locations:
                if os.path.exists(alt_loc):
                    print(f"📍 Found .so file at alternative location: {alt_loc}")
                    shutil.copy(alt_loc, so_dest)
                    print("✅ .so file copied from alternative location!")
                    break
            else:
                print("❌ Could not find .so file in any expected location")

        # Create the __init__.py in the library folder, so that delocate-wheel works properly
        Path(extdir+"/__init__.py").touch()


with open('VERSION.txt', 'r') as file:
    VERSION = file.read().replace('\n', '')
print("VERSION: "+VERSION)

setup(
    name='nimblephysics',
    version=VERSION,
    author='Keenon Werling',
    author_email='keenonwerling@gmail.com',
    description='A differentiable fully featured physics engine',
    long_description=open('README.md').read(),
    long_description_content_type='text/markdown',
    license='MIT',
    package_dir={'': 'python'},
    packages=['nimblephysics'],
    package_data={'nimblephysics': ['web_gui/*', 'web_gui/*/*',
                                    'web_gui/*/*/*', 'models/*', 'models/*/*', 'models/*/*/*']},
    ext_package='nimblephysics_libs',
    ext_modules=[CMakeExtension('_nimblephysics', target='_nimblephysics')],
    install_requires=[
        'torch',
        'numpy'
    ],
    cmdclass=dict(build_ext=CMakeBuild),
    zip_safe=False,
)