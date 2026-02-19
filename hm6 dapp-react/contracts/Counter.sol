// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;


contract Counter{
    uint count;

    function set_counter(uint _count) external{
        count = _count;
    }

    function next() external returns(uint){
        return ++count;
    }

    function get_counter() external view returns(uint){
        return count;
    }
}