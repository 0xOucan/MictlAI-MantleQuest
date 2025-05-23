/**
 * Basic tests for Nebula Action Provider
 * Tests configuration, network support, and basic functionality
 */

import { nebulaActionProvider } from "./nebulaActionProvider";
import { NebulaConstants } from "./constants";
import { NebulaConfigurationError } from "./errors";

// Mock wallet provider for testing
const mockWalletProvider = {
  getNetwork: () => Promise.resolve({ chainId: "5000" }),
  getAddress: () => Promise.resolve("0x1234567890123456789012345678901234567890"),
  sendTransaction: () => Promise.resolve("0xmocktxhash"),
  readContract: () => Promise.resolve({}),
} as any;

/**
 * Test basic provider initialization
 */
export function testProviderInitialization() {
  console.log("🧪 Testing Nebula provider initialization...");
  
  // Test with missing secret key
  const originalSecretKey = process.env.YOUR_THIRDWEB_SECRET_KEY;
  delete process.env.YOUR_THIRDWEB_SECRET_KEY;
  
  try {
    nebulaActionProvider(mockWalletProvider);
    console.log("❌ Should have thrown NebulaConfigurationError");
    return false;
  } catch (error) {
    if (error instanceof NebulaConfigurationError) {
      console.log("✅ Correctly throws NebulaConfigurationError when secret key is missing");
    } else {
      console.log("❌ Unexpected error:", error);
      return false;
    }
  }
  
  // Restore secret key and test successful initialization
  process.env.YOUR_THIRDWEB_SECRET_KEY = originalSecretKey || "test-secret-key";
  
  try {
    const provider = nebulaActionProvider(mockWalletProvider);
    console.log("✅ Provider initializes successfully with secret key");
    
    // Test network support
    const supportsMantle = provider.supportsNetwork({ chainId: "5000" } as any);
    const supportsEthereum = provider.supportsNetwork({ chainId: "1" } as any);
    
    if (supportsMantle && !supportsEthereum) {
      console.log("✅ Correctly supports only Mantle network");
    } else {
      console.log("❌ Network support check failed");
      return false;
    }
    
    return true;
  } catch (error) {
    console.log("❌ Unexpected error during initialization:", error);
    return false;
  }
}

/**
 * Test constants and configuration
 */
export function testConstants() {
  console.log("🧪 Testing Nebula constants...");
  
  // Test required constants exist
  const requiredConstants = [
    'BASE_URL',
    'CHAT_ENDPOINT', 
    'EXECUTE_ENDPOINT',
    'CHAIN_ID',
    'CHAIN_NAME'
  ];
  
  for (const constant of requiredConstants) {
    if (!(constant in NebulaConstants)) {
      console.log(`❌ Missing required constant: ${constant}`);
      return false;
    }
  }
  
  // Test URL formation
  const chatUrl = `${NebulaConstants.BASE_URL}${NebulaConstants.CHAT_ENDPOINT}`;
  const executeUrl = `${NebulaConstants.BASE_URL}${NebulaConstants.EXECUTE_ENDPOINT}`;
  
  if (chatUrl.includes("undefined") || executeUrl.includes("undefined")) {
    console.log("❌ URL formation contains undefined values");
    return false;
  }
  
  // Test chain configuration
  if (NebulaConstants.CHAIN_ID !== 5000) {
    console.log("❌ Chain ID should be 5000 for Mantle");
    return false;
  }
  
  if (NebulaConstants.CHAIN_NAME !== "mantle") {
    console.log("❌ Chain name should be 'mantle'");
    return false;
  }
  
  console.log("✅ All constants are properly configured");
  return true;
}

/**
 * Test error classes
 */
export function testErrorClasses() {
  console.log("🧪 Testing Nebula error classes...");
  
  try {
    // Test base error
    const baseError = new (require("./errors").NebulaError)("Test message", "TEST_CODE", 400);
    if (baseError.name !== "NebulaError" || baseError.code !== "TEST_CODE" || baseError.statusCode !== 400) {
      console.log("❌ NebulaError not working correctly");
      return false;
    }
    
    // Test configuration error
    const configError = new (require("./errors").NebulaConfigurationError)();
    if (configError.name !== "NebulaConfigurationError") {
      console.log("❌ NebulaConfigurationError not working correctly");
      return false;
    }
    
    // Test unsupported chain error
    const chainError = new (require("./errors").NebulaUnsupportedChainError)(1, 5000);
    if (!chainError.message.includes("Chain 1") || !chainError.message.includes("5000")) {
      console.log("❌ NebulaUnsupportedChainError not formatting message correctly");
      return false;
    }
    
    console.log("✅ Error classes work correctly");
    return true;
  } catch (error) {
    console.log("❌ Error testing error classes:", error);
    return false;
  }
}

/**
 * Run all tests
 */
export function runNebulaTests() {
  console.log("🚀 Running Nebula Action Provider tests...\n");
  
  const tests = [
    { name: "Provider Initialization", fn: testProviderInitialization },
    { name: "Constants Configuration", fn: testConstants },
    { name: "Error Classes", fn: testErrorClasses },
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    console.log(`\n📋 ${test.name}:`);
    try {
      if (test.fn()) {
        passed++;
        console.log(`✅ ${test.name} PASSED`);
      } else {
        failed++;
        console.log(`❌ ${test.name} FAILED`);
      }
    } catch (error) {
      failed++;
      console.log(`❌ ${test.name} FAILED with error:`, error);
    }
  }
  
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log("🎉 All Nebula tests passed!");
  } else {
    console.log("⚠️ Some Nebula tests failed. Please check the configuration.");
  }
  
  return failed === 0;
}

// Export for external testing
if (require.main === module) {
  runNebulaTests();
} 