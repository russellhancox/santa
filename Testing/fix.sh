#!/bin/bash
GIT_ROOT=$(git rev-parse --show-toplevel)

find ${GIT_ROOT} \( -name "*.m" -o -name "*.h" -o -name "*.mm" -o -name "*.cc" \) -exec xcrun clang-format -i {} \+
swift format -i -r ${GIT_ROOT}
buildifier --lint=fix -r ${GIT_ROOT}
