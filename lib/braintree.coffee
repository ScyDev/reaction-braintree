Meteor.Braintree =
  accountOptions: ->
    settings = ReactionCore.Collections.Packages.findOne(name: "reaction-braintree").settings
    if settings?.mode is true then environment = "production" else environment = "sandbox"
    options =
      environment: environment
      merchantId: settings?.merchant_id || Meteor.settings.braintree.merchant_id
      publicKey: settings?.public_key || Meteor.settings.braintree.public_key
      privateKey: settings?.private_key || Meteor.settings.braintree.private_key
    return options

  #authorize submits a payment authorization to Braintree
  authorize: (cardData, paymentData, callback) ->
    Meteor.call "braintreeSubmit", "authorize", cardData, paymentData, callback
    return

  # TODO - add a "charge" function that creates a new charge and captures all at once

  capture: (transactionId, amount, callback) ->
    captureDetails =
      amount: amount

    Meteor.call "braintreeCapture", transactionId, captureDetails, callback
    return

  #config is for the braintree configuration settings.
  config: (options) ->
    @accountOptions = options
    return

  paymentObj: ->
    amount: ""
    options:
      submitForSettlement: true

  #parseCardData splits up the card data and puts it into a braintree friendly format.
  parseCardData: (data) ->
    cardholderName: data.name
    number: data.number
    expirationMonth: data.expirationMonth
    expirationYear: data.expirationYear
    cvv: data.cvv

  # This needs work to support multi currency
  # Braintree uses merchant ids that must be preconfigured for each currency
  # See: https://developers.braintreepayments.com/javascript+node/sdk/server/transaction-processing/create#specifying-merchant-account
  parseCurrencyData: (data) ->
