const { network } = require("hardhat");
const {networkConfig, developmentChain} = require("../helper-hardhat-config");
const {verify} = require("../utils/verify")


// function deployFunc(hre) {
//     console.log("hi");
// };

module.exports = async (hre) => {

    const {getNamedAccounts , deployments} = hre;
    const {deploy , log } = deployments;
    const { deployer} = await getNamedAccounts();
    const chainId = network.config.chainId;
    
    // let  ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]; // lol network.chainid.ethusdprice

    let  ethUsdPriceFeedAddress

    if(developmentChain.includes(network.name)){
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    }else{
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    }

      args = [ethUsdPriceFeedAddress]

    const FundMe = await deploy("FundMe" , {
        from:deployer,
        args:args, // put price feed address 
        log:true,
        waitConfrimations: network.config.blockConfimations || 1
    });

    if(!developmentChain.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        await verify(FundMe.address, args)
    }
    log("_____________________________")
}



module.exports.tags= ["all" , "fundme"]

