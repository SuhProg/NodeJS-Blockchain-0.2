// SHA-256 is a hash generator designed by NSA
// importing SHA-256
const SHA256 = require('crypto-js/sha256');

// making it friendly to multiple transactions and defining what propreties transactions have
class Transaction{
	// a transaction always goes from someone, to someone and it carries an amount of traded assets
	constructor(fromAddress, toAddress, amount){
		this.fromAddress = fromAddress;
		this.toAddress = toAddress;
		this.amount = amount;
	}
}

class Block {
	constructor(
		// When was the block created
		timestamp,
		// content of the block (details of a transaction or terms of a contract)
		transactions,
		//gets the hash of the block that came before this one
		previousHash = ''
	)

	{
		this.previousHash = previousHash;
		this.timestamp = timestamp;
		this.transactions = transactions;
		this.hash = this.calculateHash();
		// so that the hash of the block changes and isn't limited to changing only when one of the previous variables change.
		// number that isn't connected to the chain but can be changed whenever the while loop is runing
		this.nonce = 0;
	}

	// calculates the hash function of the current block by taking the propreties of the block fore stored and running through it
	calculateHash() {
		// taking the transaction and creating a hash id that is a string
		return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
	}
	// proof of work, a way of proving that you've added an amount of computing power to making a new block. aka 'mining'. Add in a level of difficulty for creating new blocks, calculating that a block should take a certain amount of time to be created and setting out a "reward" when it's ready, as more blocks are created and more computational power's added and the complexity of generating new blocks increases.
	// add a mining method
	
	mineBlock(difficulty) {
		// looping until a hash starts with enough zeros and it'll keep runing until not all of the hash equal to zeros. Creating a string of zeroes with the same length as difficulty
		while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")){
			// incrementing this number as long as the hash doens't have enough zeroes to end the block's creation
			this.nonce++;
			this.hash = this.calculateHash();
		}
		// when the while loop's done the block's mined, so display this message
		console.log("Block mined: "+this.hash);
	}
}

// creating methods
// adding the blocks created to a chain
class Blockchain {
	constructor() {
		// this is the array of blocks in the chain
		this.chain = [this.createGenesisBlock()];
		// setting up the level of dificulty. How fast can a block be added to the blockchain?
		this.difficulty = 2;
		// making sure that, because there's only a certain amount of blocks being created every X amount of time, the pending transactions are lined up to get in on the next block
		this.pendingTransactions = [];
		// setting what's the reward for mining (how much of a certain asset is released after the block's mined?)
		this.miningReward = 100;
	}
	
	// first block in a chain is always the genesis block and has no previousHash value assigned to it
	// creating the genesis block
	createGenesisBlock() {
		return new Block(
			// timestamp
			"08/08/2018",
			// transactions
			"Genesis block",
			// previousHash
			"0"
		);
	}
	
	// adding the last blocks generated into the chain
	getLatestBlock() {
		// returns the last block ALREADY CREATED in the chain
		return this.chain[this.chain.length - 1];
	}
	
	// takes the reward for mining into the miner's wallet address once the block's successfully mined
	minePendingTransactions(miningRewardAddress){
		// creating a new block with a timestamp and the new transaction, giving it all the pending transactions stored (in bitcoin F.E. there are too many panding transactions to get in on the line, so the miner actually gets to pick which ones they want to go through)
		let block = new Block(Date.now(), this.pendingTransactions);
		// now that a new block was created we can mine the block
		block.mineBlock(this.difficulty);
		// displaying that the block was successfully mined
		console.log('Block successfully mined.');
		// add the block to the chain
		this.chain.push(block);
		// reset the pending transactions array and create a new transaction to pass the reward to the miner
		this.pendingTransactions = [
			new Transaction(
				// fromAddress is null, bc the reward isn't coming from an address since it's given by the algorithm
				null,
				// miner's wallet address
				miningRewardAddress,
				// mining reward
				this.miningReward)
		];
	}

	// reciving transactions and adding them to the pending transactions line
	createTransaction(transaction){
		// adding it to the pending transactions array
		this.pendingTransactions.push(transaction);
	}

	// checking the balance of an address, for when there's an atempt at making a transaction the algorithm goes through the history of the wallet to check if it has enough assets to make the transaction (since the user doesn't really store the amount of assets on their wallets)
	getBalanceOfAddress(address){
		// the balance will start at zero
		let balance = 0;
		// looping over the blocks at the blockchain to check for the history of transactions of this address
		for(const block of this.chain){
			// looping over the transactions of the blocks to check for the history of transactions of this address
			for(const trans of block.transactions){
				// fromAddress transfers asset away from their wallet, so that amount is reduced from there
				if(trans.fromAddress === address){
					balance -= trans.amount;
				}
				// toAddress gets asset transfered to their wallet, so that amount is added to there
				if(trans.toAddress === address){
					balance += trans.amount;
				}
			}
		}

		// returning the balance of that wallet after history checking
		return balance;
	}

	// checking the chains validation, verifying the integrity of the chain, blocks in the blockchain can never be changed or deleted.
	isChainValid(){
		// return true if the chain is valid and false if not. Starts by with i = 1 since the block 0 is the genesis block and doesn't have a transaction to check for validation.
		for (let i = 1; i < this.chain.length; i++){
			// taking the current block
			const currentBlock = this.chain[i];
			// taking the previous block for comparison, so i-1
			const previousBlock = this.chain[i - 1];
			// check if the hash of the current block is still vailed
			if(currentBlock.hash !== currentBlock.calculateHash()){
				return false;
			}
			// check if the block is pointing to the previous block by analysing the previous dash
			if(currentBlock.previousHash !== previousBlock.hash){
				return false;
			}
		}
		// if it gets to this point then the chain is vailed
		return true;
	}
}

// testing instance for this blockchain
// creating a new blockchain
let suhCoin = new Blockchain();

// creating some transactions to test being address1 and address2 the public key to someone's wallet
// from address1 to address2 an amount of 10
suhCoin.createTransaction(new Transaction('address1', 'address2', 10));
// from address2 to address1 an amount of 5
suhCoin.createTransaction(new Transaction('address1', 'address2', 5));

// after the transactions are created they'll be lined at the pending array, so the mining needs to get started to actually store those transactions in the blockchain
console.log('\nStarting the miner...');
// pass the reward to the miner's address
suhCoin.minePendingTransactions('suh-address');
// checking the miner's balance
console.log('\nBalance of Suh is: ', suhCoin.getBalanceOfAddress('suh-address'));

// do the steps above again
console.log('\nStarting the miner again...');
suhCoin.minePendingTransactions('suh-address');
console.log('\nBalance of Suh is: ', suhCoin.getBalanceOfAddress('suh-address'));

