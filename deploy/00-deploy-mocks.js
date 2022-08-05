const {network } = require("hardhat");
const {developmentChain,
       DECIMALS,
       INITIAL_ANSWER,
} = require("../helper-hardhat-config")


module.exports = async ({ getNamedAccounts, deployments}) =>{
    const {deploy ,log } = deployments;
    const {deployer} = await getNamedAccounts();
    const chainId= network.config.chainId;


    if (developmentChain.includes(network.name)){
        log("local network detected! Deploying mocks.... ")
        await deploy("MockV3Aggregator",{
            from:deployer,
            log:true,
            args:[DECIMALS, INITIAL_ANSWER]

        })
        log("Mocks deployed !")
        log("________________________________")
    }
}


module.exports.tags = ["all", "mocks"]