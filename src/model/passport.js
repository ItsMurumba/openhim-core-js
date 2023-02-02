'use strict'

import {Schema} from 'mongoose'

import {connectionAPI, connectionDefault} from '../config'

/**
 * Passport Model
 *
 * The Passport model handles associating authenticators with users. An authen-
 * ticator can be either local (password) or third-party (provider). A single
 * user can have multiple passports, allowing them to connect and use several
 * third-party strategies in optional conjunction with a password.
 *
 * Since an application will only need to authenticate a user once per session,
 * it makes sense to encapsulate the data specific to the authentication process
 * in a model of its own. This allows us to keep the session itself as light-
 * weight as possible as the application only needs to serialize and deserialize
 * the user, but not the authentication data, to and from the session.
 */

const PassportSchema = new Schema({
    // Required field: Protocol
    //
    // Defines the protocol to use for the passport. When employing the local
    // strategy, the protocol will be set to 'local'. When using a third-party
    // strategy, the protocol will be set to the standard used by the third-
    // party service (e.g. 'basic', 'openid').
    protocol: {
        type: String,
        required: true
    },
    // Local field: Password
    //
    // When the local strategy is employed, a password will be used as the
    // means of authentication along with an email.
    password: String,
    // accessToken is used to authenticate API requests. it is generated when a
    // passport (with protocol 'local') is created for a user.
    accessToken: String,

    // Provider fields: Provider, identifer and tokens
    //
    // "provider" is the name of the third-party auth service in all lowercase
    // (e.g. 'github', 'facebook') whereas "identifier" is a provider-specific
    // key, typically an ID. These two fields are used as the main means of
    // identifying a passport and tying it to a local user.
    //
    // The "tokens" field is a JSON object used in the case of the OAuth stan-
    // dards. When using OAuth 1.0, a `token` as well as a `tokenSecret` will
    // be issued by the provider. In the case of OAuth 2.0, an `accessToken`
    // and a `refreshToken` will be issued.
    provider: {
        type: String,
        enum: ['local'],
        default: 'local'
    },
    identifier : String,
    tokens     : Object,
    // Associations
    //
    // Associate every passport with one, and only one, user.
    user: { type: Schema.Types.ObjectId, ref: 'User' },
})


// compile the Passport Schema into a Model
export const PassportModelAPI = connectionAPI.model('Passport', PassportSchema)
export const PassportModel = connectionDefault.model('Passport', PassportSchema)  


/**
 * Register a passport
 *
 * This method creates a new passport from a specified email, username and password
 * and assign it to a newly created user.
 *
 */
 export const createPassport = async function (user, password) {
    let result = {error: null, user: null}
    return await PassportModelAPI.create({
      protocol: 'local',
      password: password,
      user: user.id
    })
      .then(async function (passport) {
        result.user = user
        return result
      })
      .catch(err => {
        result.error = err
        return result
      })
  }
  
  /**
   * Update a passport
   *
   * This method updates a passport of a specific user
   *
   */
  export const updatePassport = async function (user, passport) {
    let result = {error: null, user: null}
    return PassportModelAPI.updateOne(passport)
      .then(function (passport) {
        result.user = user
        return result
      })
      .catch(err => {
        result.error = err
        return result
      })
  }
