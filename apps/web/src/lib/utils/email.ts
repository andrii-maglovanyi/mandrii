type IsEmailOptions = {
  requireDot?: boolean;
};

/**
 * Returns whether the given string is a valid email address.
 * @param value   The email to validate
 * @param options Optional options object. May contain the following property:
 *                requireDot - Boolean whether email without dot is allowed
 */
export const isEmail = (value: string, options?: IsEmailOptions) => {
  const atIndex = value.indexOf("@");
  const { requireDot = true } = options || {};

  if (atIndex < 1 || value.includes(" ")) {
    return false; // email needs to have an '@', and may not contain any spaces
  }

  const dotIndex = value.lastIndexOf(".");
  if (dotIndex === -1) {
    // no dot is fine, as long as the '@' is followed by at least two more characters
    // and strict validation is disabled
    return requireDot === true ? false : atIndex < value.length - 2;
  }

  // but if there is a dot after the '@', it must be followed by at least two more characters
  return dotIndex > atIndex ? dotIndex < value.length - 2 : true;
};
