cmake_minimum_required(VERSION 3.14)
project(DealershipAPI CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Dependencies: Crow & SQLite3
find_package(SQLite3 REQUIRED)
find_package(Threads REQUIRED)

# If Crow is installed via vcpkg or system package
find_package(Crow CONFIG)

add_executable(dealership_server src/main.cpp)

if(Crow_FOUND)
    target_link_libraries(dealership_server PRIVATE Crow::Crow SQLite3::SQLite3 Threads::Threads)
else()
    # Fallback to header-only include
    target_include_directories(dealership_server PRIVATE include ${SQLite3_INCLUDE_DIRS})
    target_link_libraries(dealership_server PRIVATE ${SQLite3_LIBRARIES} Threads::Threads)
endif()
