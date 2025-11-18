import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  ISignUpResult,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
};

const userPool = new CognitoUserPool(poolData);

/**
 * Sign up a new user
 */
export function signUp(
  email: string,
  password: string,
  name: string,
  role: 'customer' | 'host' = 'customer'
): Promise<ISignUpResult> {
  return new Promise((resolve, reject) => {
    const username = email.trim().toLowerCase();
    const attributeList = [
      new CognitoUserAttribute({ Name: 'email', Value: username }),
      new CognitoUserAttribute({ Name: 'name', Value: name }),
      new CognitoUserAttribute({ Name: 'custom:role', Value: role }),
    ];

    userPool.signUp(username, password, attributeList, [], (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result!);
    });
  });
}

/**
 * Resend the verification code to the user's email
 */
export function resendConfirmationCode(email: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const username = email.trim().toLowerCase();
    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: userPool,
    });

    cognitoUser.resendConfirmationCode((err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

/**
 * Confirm user registration with verification code
 */
export function confirmSignUp(email: string, code: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const username = email.trim().toLowerCase();
    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: userPool,
    });

    cognitoUser.confirmRegistration(code, true, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

/**
 * Sign in a user
 */
export interface SignInResult {
  session: CognitoUserSession;
  attributes: Record<string, string>;
}

export function signIn(email: string, password: string): Promise<SignInResult> {
  return new Promise((resolve, reject) => {
    const username = email.trim().toLowerCase();
    const authenticationDetails = new AuthenticationDetails({
      Username: username,
      Password: password,
    });

    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: userPool,
    });

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (session) => {
        // Fetch attributes using the same cognitoUser instance to avoid "not authenticated" errors
        cognitoUser.getUserAttributes((err, attributes) => {
            if (err) {
              if (process.env.NODE_ENV !== 'production') {
                console.error('[cognito] getUserAttributes after signIn failed', err);
              }
              // resolve with empty attributes if attribute retrieval fails
              resolve({ session, attributes: {} });
              return;
            }

          const attributesMap: Record<string, string> = {};
          attributes?.forEach((attr) => {
            attributesMap[attr.Name] = attr.Value;
          });

          resolve({ session, attributes: attributesMap });
        });
      },
      onFailure: (err: unknown) => {
        if (process.env.NODE_ENV !== 'production') {
          console.error('[cognito] authenticateUser onFailure', err);
        }
        reject(err);
      },
    });
  });
}

/**
 * Get current session and attributes together using the current CognitoUser instance.
 * This avoids the race where getCurrentUser() isn't yet populated.
 */
export function getSessionAndAttributes(): Promise<SignInResult> {
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) {
      reject(new Error('No user found'));
      return;
    }

    cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err) {
        reject(err);
        return;
      }
      if (!session) {
        reject(new Error('No session found'));
        return;
      }

      cognitoUser.getUserAttributes((attrErr, attributes) => {
        if (attrErr) {
          if (process.env.NODE_ENV !== 'production') {
            console.error('[cognito] getUserAttributes in getSessionAndAttributes failed', attrErr);
          }
          resolve({ session, attributes: {} });
          return;
        }

        const attributesMap: Record<string, string> = {};
        attributes?.forEach((attr) => {
          attributesMap[attr.Name] = attr.Value;
        });

        resolve({ session, attributes: attributesMap });
      });
    });
  });
}

/**
 * Map common Cognito error objects to friendly messages.
 */
export function mapCognitoError(err: unknown): Error {
  const getProp = (o: unknown, k: string): unknown => {
    if (o && typeof o === 'object' && k in (o as Record<string, unknown>)) {
      return (o as Record<string, unknown>)[k];
    }
    return undefined;
  };

  const code = (getProp(err, 'code') ?? getProp(err, 'name') ?? getProp(err, '__type') ?? '') as unknown;
  let friendly = 'An error occurred';

  switch ((code || '').toString()) {
    case 'UserNotFoundException':
      friendly = 'No account found for that email.';
      break;
    case 'NotAuthorizedException':
      friendly = 'Incorrect email or password.';
      break;
    case 'UserNotConfirmedException':
      friendly = 'Your account is not verified. Please check your email for the confirmation code.';
      break;
    case 'InvalidParameterException':
      friendly = 'Invalid parameters were provided.';
      break;
    case 'PasswordResetRequiredException':
      friendly = 'Password reset is required for this account.';
      break;
    case 'CodeMismatchException':
      friendly = 'Invalid verification code.';
      break;
    case 'ExpiredCodeException':
      friendly = 'The verification code has expired.';
      break;
    case 'TooManyRequestsException':
    case 'LimitExceededException':
      friendly = 'Too many requests. Please try again later.';
      break;
    case 'InvalidPasswordException':
      friendly = 'Password does not meet the required policy.';
      break;
    default:
      // Attempt to fall back to the original message when available
      const msg = getProp(err, 'message');
      if (typeof msg === 'string' && msg) {
        friendly = msg;
      } else if (err) {
        friendly = String(err);
      }
      break;
  }

  const e = new Error(friendly) as Error & { original?: unknown; code?: string };
  e.original = err;
  e.code = String(code);
  return e;
}

/**
 * Sign out the current user
 */
export function signOut(): void {
  const cognitoUser = userPool.getCurrentUser();
  if (cognitoUser) {
    cognitoUser.signOut();
  }
}

/**
 * Get the current authenticated user
 */
export function getCurrentUser(): CognitoUser | null {
  return userPool.getCurrentUser();
}

/**
 * Get the current user session
 */
export function getCurrentSession(): Promise<CognitoUserSession> {
  return new Promise((resolve, reject) => {
    const cognitoUser = getCurrentUser();
    if (!cognitoUser) {
      reject(new Error('No user found'));
      return;
    }

    cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err) {
        reject(err);
        return;
      }
      if (!session) {
        reject(new Error('No session found'));
        return;
      }
      resolve(session);
    });
  });
}

/**
 * Get user attributes
 */
export function getUserAttributes(): Promise<Record<string, string>> {
  return new Promise((resolve, reject) => {
    const cognitoUser = getCurrentUser();
    if (!cognitoUser) {
      reject(new Error('No user found'));
      return;
    }

    cognitoUser.getUserAttributes((err, attributes) => {
      if (err) {
        reject(err);
        return;
      }

      const attributesMap: Record<string, string> = {};
      attributes?.forEach((attr) => {
        attributesMap[attr.Name] = attr.Value;
      });

      resolve(attributesMap);
    });
  });
}

/**
 * Refresh the current session
 */
export function refreshSession(): Promise<CognitoUserSession> {
  return new Promise((resolve, reject) => {
    const cognitoUser = getCurrentUser();
    if (!cognitoUser) {
      reject(new Error('No user found'));
      return;
    }

    cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err) {
        reject(err);
        return;
      }
      if (!session) {
        reject(new Error('No session found'));
        return;
      }

      const refreshToken = session.getRefreshToken();
      cognitoUser.refreshSession(refreshToken, (refreshErr, newSession) => {
        if (refreshErr) {
          reject(refreshErr);
          return;
        }
        resolve(newSession);
      });
    });
  });
}

/**
 * Forgot password - send verification code
 */
export function forgotPassword(email: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const username = email.trim().toLowerCase();
    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: userPool,
    });

    cognitoUser.forgotPassword({
      onSuccess: () => {
        resolve();
      },
      onFailure: (err: unknown) => {
        reject(err);
      },
    });
  });
}

/**
 * Confirm new password with verification code
 */
export function confirmPassword(
  email: string,
  code: string,
  newPassword: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const username = email.trim().toLowerCase();
    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: userPool,
    });

    cognitoUser.confirmPassword(code, newPassword, {
      onSuccess: () => {
        resolve();
      },
      onFailure: (err: unknown) => {
        reject(err);
      },
    });
  });
}
