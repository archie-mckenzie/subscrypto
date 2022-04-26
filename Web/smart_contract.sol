pragma solidity ^0.6.6;

contract CoolStatementsContract {
    string[] public coolStatements;
    
    function setCoolStatement(string _coolStatement) public {
        coolStatements.push(_coolStatement);
    }
}