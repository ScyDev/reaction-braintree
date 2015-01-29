Braintree = Npm.require('braintree')
Fiber = Npm.require("fibers")
Future = Npm.require("fibers/future")

Meteor.methods
  #submit (sale, authorize)
  braintreeSubmit: (transactionType, cardData, paymentData) ->
    accountOptions = Meteor.Braintree.accountOptions()
    if accountOptions.environment is "production"
      accountOptions.environment = Braintree.Environment.Production
    else
      accountOptions.environment = Braintree.Environment.Sandbox

    gateway = Braintree.connect accountOptions

    paymentObj = Meteor.Braintree.paymentObj()
    if transactionType is "authorize" then paymentObj.options.submitForSettlement = false
    paymentObj.creditCard = Meteor.Braintree.parseCardData(cardData)
    paymentObj.amount = paymentData.total

    fut = new Future()
    @unblock()

    gateway.transaction.sale paymentObj, Meteor.bindEnvironment((error, result) ->
      if error
        fut.return
          saved: false
          error: err
      else if not result.success
        fut.return
          saved: false
          response: result
      else
        fut.return
          saved: true
          response: result
      return
    , (e) ->
      ReactionCore.Events.warn e
      return
    )
    fut.wait()

  # capture (existing authorization)
  braintreeCapture: (transactionId, captureDetails) ->
    accountOptions = Meteor.Braintree.accountOptions()
    if accountOptions.environment is "production"
      accountOptions.environment = Braintree.Environment.Production
    else
      accountOptions.environment = Braintree.Environment.Sandbox

    gateway = Braintree.connect accountOptions

    fut = new Future()
    @unblock()
    gateway.transaction.submit_for_settlement transactionId, captureDetails, Meteor.bindEnvironment((error, result) ->
      if error
        fut.return
          saved: false
          error: error
      else
        fut.return
          saved: true
          response: result
      return
    , (e) ->
      ReactionCore.Events.warn e
      return
    )
    fut.wait()
