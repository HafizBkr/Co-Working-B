const axios = require("axios");

const BASE_URL = "http://localhost:5000"; // ✅ Port correct
const TEST_USER = {
  email: "testload@example.com",
  password: "TestLoad123!",
};

// Configuration optimisée
const REQUEST_TIMEOUT = 10000;
const MAX_RETRIES = 2;

class ComprehensiveLoadTest {
  constructor() {
    this.results = {
      totalUsers: 0,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      authErrors: 0,
      timeoutErrors: 0,
      rateLimitErrors: 0,
      serverErrors: 0,
      responseTimes: [],
      endpointStats: {},
    };
  }

  async makeRequestWithRetry(requestFn, retries = MAX_RETRIES) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        if (attempt === retries) throw error;

        if (
          error.code === "ECONNABORTED" ||
          error.response?.status >= 500 ||
          error.code === "ECONNRESET"
        ) {
          await new Promise((resolve) => setTimeout(resolve, 100 * attempt));
          continue;
        }
        throw error;
      }
    }
  }

  async testEndpoints(token) {
    // ✅ Endpoints basés sur votre vraie API
    const endpoints = [
      {
        name: "health",
        method: "GET",
        url: "/api/v1/health",
        needsAuth: false,
        weight: 30,
      },
      {
        name: "workspaces_list",
        method: "GET",
        url: "/api/v1/workspaces",
        needsAuth: true,
        weight: 40,
      },
      {
        name: "auth_check",
        method: "GET",
        url: "/api/v1/workspaces", // Test de l'authentification
        needsAuth: true,
        weight: 30,
      },
    ];

    const totalWeight = endpoints.reduce((sum, ep) => sum + ep.weight, 0);
    const random = Math.random() * totalWeight;
    let currentWeight = 0;

    for (const endpoint of endpoints) {
      currentWeight += endpoint.weight;
      if (random <= currentWeight) {
        return endpoint;
      }
    }

    return endpoints[0];
  }

  async simulateUser(userId, durationMs) {
    const startTime = Date.now();
    const endTime = startTime + durationMs;

    let requests = 0;
    let successful = 0;
    let failed = 0;
    let token = null;
    const userResponseTimes = [];
    const errors = { auth: 0, timeout: 0, rateLimit: 0, server: 0, other: 0 };

    try {
      // 1. Authentification
      const loginStart = Date.now();
      const loginResponse = await this.makeRequestWithRetry(() =>
        axios.post(`${BASE_URL}/api/v1/auth/login`, TEST_USER, {
          timeout: REQUEST_TIMEOUT,
          headers: { "Content-Type": "application/json" },
        }),
      );

      const loginTime = Date.now() - loginStart;
      userResponseTimes.push(loginTime);

      token = loginResponse.data.data.token;
      requests++;
      successful++;
    } catch (error) {
      requests++;
      failed++;
      this.categorizeError(error, errors);
      console.log(
        `❌ Utilisateur ${userId} - Échec de connexion: ${error.message}`,
      );
      return {
        userId,
        requests,
        successful,
        failed,
        errors,
        responseTimes: userResponseTimes,
      };
    }

    // 2. Simulation d'activité
    while (Date.now() < endTime) {
      try {
        const requestStart = Date.now();
        const endpoint = await this.testEndpoints(token);

        const config = {
          timeout: REQUEST_TIMEOUT,
          headers: endpoint.needsAuth
            ? {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              }
            : { "Content-Type": "application/json" },
        };

        await this.makeRequestWithRetry(() =>
          axios({
            method: endpoint.method,
            url: `${BASE_URL}${endpoint.url}`,
            ...config,
          }),
        );

        const requestTime = Date.now() - requestStart;
        userResponseTimes.push(requestTime);

        if (!this.results.endpointStats[endpoint.name]) {
          this.results.endpointStats[endpoint.name] = {
            success: 0,
            failure: 0,
          };
        }
        this.results.endpointStats[endpoint.name].success++;

        requests++;
        successful++;

        // Délai réaliste (1-3 secondes)
        const delay = Math.random() * 2000 + 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      } catch (error) {
        requests++;
        failed++;
        this.categorizeError(error, errors);
      }
    }

    return {
      userId,
      requests,
      successful,
      failed,
      errors,
      responseTimes: userResponseTimes,
    };
  }

  categorizeError(error, errorCounts) {
    if (error.code === "ECONNABORTED") {
      errorCounts.timeout++;
      this.results.timeoutErrors++;
    } else if (
      error.response?.status === 401 ||
      error.response?.status === 403
    ) {
      errorCounts.auth++;
      this.results.authErrors++;
    } else if (error.response?.status === 429) {
      errorCounts.rateLimit++;
      this.results.rateLimitErrors++;
    } else if (error.response?.status >= 500) {
      errorCounts.server++;
      this.results.serverErrors++;
    } else {
      errorCounts.other++;
    }
  }

  async runLoadTest(concurrentUsers, durationSeconds) {
    console.log(
      `🚀 Test de charge: ${concurrentUsers} utilisateurs pendant ${durationSeconds} secondes`,
    );

    const startTime = Date.now();
    this.results.totalUsers = concurrentUsers;

    // Reset stats
    Object.keys(this.results).forEach((key) => {
      if (typeof this.results[key] === "number") {
        this.results[key] = 0;
      }
    });
    this.results.responseTimes = [];
    this.results.endpointStats = {};

    const userPromises = Array.from({ length: concurrentUsers }, (_, i) =>
      this.simulateUser(i, durationSeconds * 1000),
    );

    const results = await Promise.allSettled(userPromises);

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        const userResult = result.value;
        this.results.totalRequests += userResult.requests;
        this.results.successfulRequests += userResult.successful;
        this.results.failedRequests += userResult.failed;
        this.results.responseTimes.push(...userResult.responseTimes);
      } else {
        this.results.failedRequests += 1;
        this.results.totalRequests += 1;
      }
    });

    const actualDuration = (Date.now() - startTime) / 1000;

    return {
      users: concurrentUsers,
      duration: actualDuration,
      ...this.results,
      requestsPerSecond: this.results.totalRequests / actualDuration,
      avgResponseTime:
        this.results.responseTimes.length > 0
          ? this.results.responseTimes.reduce((a, b) => a + b, 0) /
            this.results.responseTimes.length
          : 0,
      maxResponseTime:
        this.results.responseTimes.length > 0
          ? Math.max(...this.results.responseTimes)
          : 0,
      minResponseTime:
        this.results.responseTimes.length > 0
          ? Math.min(...this.results.responseTimes)
          : 0,
    };
  }

  printResults(result) {
    console.log("\n📊 RÉSULTATS DU TEST DE CHARGE");
    console.log("=".repeat(50));
    console.log(`👥 Utilisateurs simultanés: ${result.users}`);
    console.log(`⏱️  Durée: ${result.duration.toFixed(2)}s`);
    console.log(`📈 Total requêtes: ${result.totalRequests}`);
    console.log(`✅ Requêtes réussies: ${result.successfulRequests}`);
    console.log(`❌ Requêtes échouées: ${result.failedRequests}`);
    console.log(`🔐 Erreurs auth: ${result.authErrors}`);
    console.log(`⏱️  Erreurs timeout: ${result.timeoutErrors}`);
    console.log(`🚦 Rate limit: ${result.rateLimitErrors}`);

    const successRate =
      (result.successfulRequests / result.totalRequests) * 100;
    console.log(`📊 Taux de succès: ${successRate.toFixed(2)}%`);
    console.log(`🚀 Requêtes/seconde: ${result.requestsPerSecond.toFixed(2)}`);
    console.log(
      `⚡ Temps réponse moyen: ${result.avgResponseTime.toFixed(2)}ms`,
    );
    console.log(`🐌 Temps réponse max: ${result.maxResponseTime.toFixed(2)}ms`);

    // Évaluation
    if (successRate >= 98 && result.avgResponseTime < 200) {
      console.log("🟢 Performance: EXCELLENTE");
      console.log(
        `📊 Capacité estimée: ${Math.floor(result.users * 1.5)} utilisateurs`,
      );
    } else if (successRate >= 95 && result.avgResponseTime < 400) {
      console.log("🟡 Performance: BONNE");
      console.log(
        `📊 Capacité estimée: ${Math.floor(result.users * 1.2)} utilisateurs`,
      );
    } else if (successRate >= 90) {
      console.log("🟠 Performance: MOYENNE");
      console.log(`📊 Capacité actuelle: ~${result.users} utilisateurs`);
    } else {
      console.log("🔴 Performance: À AMÉLIORER");
      console.log(`📊 Limite: ${Math.floor(result.users * 0.8)} utilisateurs`);
    }
  }
}

async function runComprehensiveLoadTest() {
  const loadTest = new ComprehensiveLoadTest();

  const testScenarios = [
    { users: 5, duration: 30, name: "Warm-up" },
    { users: 10, duration: 30, name: "Light Load" },
    { users: 25, duration: 45, name: "Medium Load" },
    { users: 50, duration: 45, name: "Heavy Load" },
    { users: 100, duration: 60, name: "Stress Test" },
  ];

  console.log("🎯 TEST DE CHARGE COMPLET - PORT 5000");
  console.log("=".repeat(60));
  console.log("🔧 Endpoints: health, workspaces, auth");
  console.log("⚙️  Timeout: 10s, Retry: 2x");

  let maxCapacity = 0;

  for (const scenario of testScenarios) {
    try {
      console.log(`\n${"=".repeat(40)}`);
      console.log(`🧪 SCÉNARIO: ${scenario.name} (${scenario.users} users)`);
      console.log(`${"=".repeat(40)}`);

      const result = await loadTest.runLoadTest(
        scenario.users,
        scenario.duration,
      );
      loadTest.printResults(result);

      const successRate =
        (result.successfulRequests / result.totalRequests) * 100;
      if (successRate >= 95 && result.avgResponseTime < 500) {
        maxCapacity = scenario.users;
      }

      if (successRate < 90 || result.avgResponseTime > 1000) {
        console.log(`\n🛑 ARRÊT - Performance critique`);
        break;
      }

      console.log("\n⏸️  Pause 15s...");
      await new Promise((resolve) => setTimeout(resolve, 15000));
    } catch (error) {
      console.error(`❌ Erreur ${scenario.name}:`, error.message);
      break;
    }
  }

  console.log("\n🏆 RÉSUMÉ FINAL");
  console.log("=".repeat(40));
  console.log(`🎯 Capacité maximale: ${maxCapacity} utilisateurs simultanés`);
  console.log(
    `💡 Recommandation: ${Math.floor(maxCapacity * 0.8)} utilisateurs en production`,
  );
}

runComprehensiveLoadTest().catch(console.error);
