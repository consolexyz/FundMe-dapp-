const {deployments, ethers, getNamedAccounts, network} = require("hardhat");
const {assert , expect}= require("chai");
const { developmentChain } = require("../../helper-hardhat-config");


!developmentChain.includes(network.name)
    ? describe.skip
    :describe("FundMe", async function () {

    let fundMe
    let deployer
    let mockV3Aggregator
    const sendValue = ethers.utils.parseEther("1")

    beforeEach(async function(){
        // deploy our fundMe contract 
        // using Hardhat-deploy 
        deployer =(await getNamedAccounts()).deployer;
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe" , deployer);
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator" , deployer);
    })
   describe("constructor" , async function() {
    it("sets the aggregator addresses correctly" , async function () {
        const response = await fundMe.getPriceFeed()
        assert.equal( response, mockV3Aggregator.address)
    })
      
   })
    
   describe("fund" , async function () {
    it("Fails if you don't send enough ETH", async function (){
         expect(fundMe.fund()).to.be.revertedWith("you need to spend more ETH!")
    })

    it("updated the amount funded data struture" , async function(){

        await fundMe.fund({ value: sendValue })
        const response = await fundMe.getAddressToAmountFunded(deployer)
        assert.equal(response.toString(), sendValue.toString())
    })

    it( "Adds funder to array of funders" , async function(){
        await fundMe.fund({value : sendValue})
        const response = await fundMe.getFunder(0)
        assert.equal( response, deployer);
    })
   })

   describe("withdraw" ,async function (){
    beforeEach(async function(){
        await fundMe.fund({ value: sendValue})
    })

     it("withdraw Eth from a single founder" , async function (){

        const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
        )
        const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
        )

        const transcationResponse = await fundMe.withdraw();
        const transcationReceipt = await transcationResponse.wait(1);
        const {gasUsed, effectiveGasPrice}  = transcationReceipt
        const gasCost = gasUsed.mul(effectiveGasPrice)

        const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
        )

        const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
        )

        assert.equal(endingFundMeBalance, 0)
        assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString() , endingDeployerBalance.add(gasCost).toString())
     })

     it("is allows us to withdraw with multiple funders", async () => {
        // Arrange
        const accounts = await ethers.getSigners()
        for (i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(
                accounts[i]
            )
            await fundMeConnectedContract.fund({ value: sendValue })
        }
        const startingFundMeBalance =
            await fundMe.provider.getBalance(fundMe.address)
        const startingDeployerBalance =
            await fundMe.provider.getBalance(deployer)

        // Act
        // const transactionResponse = await fundMe.cheaperWithdraw()
        // Let's comapre gas costs :)
        const transactionResponse = await fundMe.withdraw()
        const transactionReceipt = await transactionResponse.wait()
        const { gasUsed, effectiveGasPrice } = transactionReceipt
        const withdrawGasCost = gasUsed.mul(effectiveGasPrice)
        // console.log(`GasCost: ${withdrawGasCost}`)
        // console.log(`GasUsed: ${gasUsed}`)
        // console.log(`GasPrice: ${effectiveGasPrice}`)
        const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
        )
        const endingDeployerBalance =
            await fundMe.provider.getBalance(deployer)
        // Assert
        assert.equal(
            startingFundMeBalance
                .add(startingDeployerBalance)
                .toString(),
            endingDeployerBalance.add(withdrawGasCost).toString()
        )
        // Make a getter for storage variables
        await expect(fundMe.getFunder(0)).to.be.reverted

        for (i = 1; i < 6; i++) {
            assert.equal(
                await fundMe.getAddressToAmountFunded(
                    accounts[i].address
                ),
                0
            )
        }
    })

    it("it only allows the the owner to withdaw" , async function (){

        const accounts = ethers.getSigner();
        const attacker = accounts[1];
        const attackerConnectedContarct = await fundMe.connect(attacker);

         expect(attackerConnectedContarct.withdraw()).to.be.revertedWith("FundMe_Owner")

    
    })
   })
})


