const { HeatSDK,Configuration,Builder,attachment,Transaction } = require("heat-sdk")
const _ = require("lodash")

function isValidAddress(value) {
  return _.isString(value) && !isNaN(Number(value)) && Number(value) != 0
}

function getAddress(privateKey) {
  const sdk = new HeatSDK()  
  return sdk.crypto.getAccountId(privateKey);
}

/**
 * Create a transaction to transfer HEAT.
 * 
 * @param {String} key 
 * @param {String | null} recipientAddress 
 * @param {String | null} recipientPublicKey 
 * @param {String} amount 
 * @param {String | null} fee 
 * @param {'prod' | 'test' | null} networkType 
 * @param {String | null} message 
 * @param {Boolean | null} messageIsPrivate 
 * @param {Boolean | null} messageIsBinary 
 * 
 * @returns bytes HEX string
 */
function transferHeat(key, recipientAddress, recipientPublicKey, amount, fee, networkType, message, messageIsPrivate, messageIsBinary) {
  if (!_.isString(key)) throw new Error(`Key arg should be "String"`)
  if (!isValidAddress(recipientAddress)) throw new Error(`recipientAddress arg should be "String"`)
  if (recipientPublicKey && !_.isString(recipientPublicKey)) throw new Error(`recipientPublicKey arg should be "String"`)
  if (!_.isString(amount) && !isNaN(Number(amount)) && Number(amount) > 0) throw new Error(`amount arg should be "String"`)
  if (!_.isString(fee) && !isNaN(Number(fee)) && Number(fee) > 0) throw new Error(`fee arg should be "String"`)
  if (!_.isString(networkType)) throw new Error(`networkType arg should be "String"`)
  if (message && !_.isString(message)) throw new Error(`message arg should be "String"`)
  if (!_.isBoolean(messageIsPrivate)) throw new Error(`messageIsPrivate arg should be "Boolean"`)
  if (!_.isBoolean(messageIsBinary)) throw new Error(`messageIsBinary arg should be "Boolean"`)

  // console.log('transferHeat',{key, recipientAddress, recipientPublicKey, amount, fee, networkType, message, messageIsPrivate, messageIsBinary})

  const isTestnet = networkType == 'test' ? true : false
  const sdk = new HeatSDK(new Configuration({isTestnet:isTestnet}))
  const recipientAddressOrPublicKey = (_.isString(recipientPublicKey) ? recipientPublicKey : recipientAddress)
  let builder = new Builder()
    .isTestnet(sdk.config.isTestnet)
    .genesisKey(sdk.config.genesisKey)
    .attachment(attachment.ORDINARY_PAYMENT)
    .amountHQT(amount)
    .feeHQT(fee)
  let txn = new Transaction(sdk, recipientAddressOrPublicKey, builder)
  if (message) {
    txn = messageIsPrivate ? txn.privateMessage(message, messageIsBinary) : txn.publicMessage(message, messageIsBinary)
  }
  return txn.sign(key).then(t => {
    let transaction = t.getTransaction()
    let bytes = transaction.getBytesAsHex()
    return bytes
  }) 
}

/**
 * Create a transaction to transfer HEAT.
 * 
 * @param {String} key 
 * @param {String | null} recipientAddress 
 * @param {String | null} recipientPublicKey 
 * @param {String} amount 
 * @param {String | null} fee 
 * @param {'prod' | 'test' | null} networkType 
 * @param {String | null} message 
 * @param {Boolean | null} messageIsPrivate 
 * @param {Boolean | null} messageIsBinary 
 * 
 * @returns bytes HEX string
 */
function transferAsset(key, recipientAddress, recipientPublicKey, amount, fee, networkType, asset, message, messageIsPrivate, messageIsBinary) {
  if (!_.isString(key)) throw new Error(`Key arg should be "String"`)
  if (!isValidAddress(recipientAddress)) throw new Error(`recipientAddress arg should be "String"`)
  if (recipientPublicKey && !_.isString(recipientPublicKey)) throw new Error(`recipientPublicKey arg should be "String"`)
  if (!_.isString(amount) && !isNaN(Number(amount)) && Number(amount) > 0) throw new Error(`amount arg should be "String"`)
  if (!_.isString(fee) && !isNaN(Number(fee)) && Number(fee) > 0) throw new Error(`fee arg should be "String"`)
  if (!_.isString(networkType)) throw new Error(`networkType arg should be "String"`)
  if (!isValidAddress(asset)) throw new Error(`asset arg not valid should be "String"`)
  if (message && !_.isString(message)) throw new Error(`message arg should be "String"`)
  if (!_.isBoolean(messageIsPrivate)) throw new Error(`messageIsPrivate arg should be "Boolean"`)
  if (!_.isBoolean(messageIsBinary)) throw new Error(`messageIsBinary arg should be "Boolean"`)

  // console.log('transferHeat',{key, recipientAddress, recipientPublicKey, amount, fee, networkType, message, messageIsPrivate, messageIsBinary})

  const isTestnet = networkType == 'test' ? true : false
  const sdk = new HeatSDK(new Configuration({isTestnet:isTestnet}))
  const recipientAddressOrPublicKey = (_.isString(recipientPublicKey) ? recipientPublicKey : recipientAddress)
  let builder = new Builder()
    .isTestnet(sdk.config.isTestnet)
    .genesisKey(sdk.config.genesisKey)
    .attachment(new attachment.AssetTransfer().init(asset, amount))
    .amountHQT("0")
    .feeHQT(fee)
  let txn = new Transaction(sdk, recipientAddressOrPublicKey, builder)
  if (message) {
    txn = messageIsPrivate ? txn.privateMessage(message, messageIsBinary) : txn.publicMessage(message, messageIsBinary)
  }
  return txn.sign(key).then(t => {
    let transaction = t.getTransaction()
    let bytes = transaction.getBytesAsHex()
    return bytes
  }) 
}

module.exports = {
  isValidAddress,
  getAddress,
  transferHeat,
  transferAsset
}