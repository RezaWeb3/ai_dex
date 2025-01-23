import {ethers} from 'ethers'

// Given that the tokens have a very large supply, we want to use short-scale notations.
export const formatLargeNumber = (num)=> {
    if (num === 0) return "0";
    const suffixes = ["", "K", "M", "B", "T", "P", "E", "L", "F", "R"]; // Suffixes for each order of magnitude
    const magnitude = Math.floor(Math.log10(num) / 3); // Determine the order of magnitude
    const shortValue = num / Math.pow(10, magnitude * 3); // Scale the number
    const formatted = Math.floor(shortValue); // Remove fractions
    const suffix = suffixes[magnitude] || ""; // Pick the appropriate suffix
  
    return `${formatted}${suffix}`;
  }


// We want to be able to convert short-scale notations to the actual numbers
export const parseFormattedNumber = (formattedStr) => {
    const suffixes = { K: 1e3, M: 1e6, B: 1e9, T: 1e12, P: 1e15, E: 1e18 , L:1e21, F:1e24, R:1e27}; // Mapping of suffixes to values
  
    // Extract the number part and suffix part using regex
    const match = formattedStr.match(/^(\d+)([KMBTPELFR]?)$/i);
    if (!match) {
      throw new Error("Invalid formatted number");
    }
  
    const value = parseInt(match[1], 10); // Extract and convert the numeric part
    const suffix = match[2].toUpperCase(); // Extract the suffix and normalize it
  
    // Convert back to the full number
    const multiplier = suffixes[suffix] || 1; // Default to 1 if no suffix
    return value * multiplier;
  }

export const stringToTokens = (amountStr)=>{
    return ethers.utils.parseUnits(amountStr, "ether");
}