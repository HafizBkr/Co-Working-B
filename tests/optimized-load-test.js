const axios = require("axios");

const BASE_URL = "http://localhost:5000";
const TEST_USER = {
  email: "testload@example.com",
  password: "TestLoad123!",
};

class OptimizedLoadTest {
  constructor() {
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      rateLimitErrors: 0,
      avgResponseTime: 0,
      responseTimes: [],
    };
  }

  async makeRequestWithBackoff(requestFn, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        if (error.response?.status === 429) {
          const backoffTime = Math.min(1000 * Math.pow(2, attempt), 10000);
          console.log(`⏳ Rate limit détecté, attente ${backoffTime}ms...`);
          await new Promise((resolve) => setTimeout(resolve, backoffTime));
          continue;
        }

        if (attempt === maxRetries) throw error;
        await new Promise((resolve) => setTimeout(resolve, 100 * attempt));
      }
    }
  }

  async simulateUserWithThrottling(userId, durationMs) {
    let requests = 0;
    let successful = 0;
    let failed = 0;
    let rateLimited = 0;
    let token = null;
    const responseTimes = [];

    const startTime = Date.now();
    const endTime = startTime + durationMs;

    try {
      const loginStart = Date.now();
      const loginResponse = await this.makeRequestWithBackoff(() =>
        axios.post(`${BASE_URL}/api/v1/auth/login`, TEST_USER, {
          timeout: 8000,
          headers: { "Content-Type": "application/json" },
        }),
      );

      const loginTime = Date.now() - loginStart;
      responseTimes.push(loginTime);
      token = loginResponse.data.data.token;
      requests++;
      successful++;
    } catch (error) {
      console.log(`❌ Utilisateur ${userId} - Login failed: ${error.message}`);
      requests++;
      failed++;
      return {
        userId,
        requests,
        successful,
        failed,
        rateLimited,
        responseTimes,
      };
    }

    while (Date.now() < endTime) {
      try {
        const requestStart = Date.now();

        const endpoints = [
          () => axios.get(`${BASE_URL}/api/v1/health`, { timeout: 5000 }),
          () =>
            axios.get(`${BASE_URL}/api/v1/workspaces`, {
              headers: { Authorization: `Bearer ${token}` },
              timeout: 5000,
            }),
        ];

        const randomEndpoint =
          endpoints[Math.floor(Math.random() * endpoints.length)];
        await this.makeRequestWithBackoff(randomEndpoint);

        const requestTime = Date.now() - requestStart;
        responseTimes.push(requestTime);
        requests++;
        successful++;

        // ✅ Délai adaptatif basé sur le nombre d'utilisateurs
        // Plus d'utilisateurs = délai plus long pour éviter le rate limiting
        const baseDelay = 2000; // 2 secondes de base
        const userMultiplier = userId > 10 ? 1.5 : 1; // Délai plus long pour les derniers utilisateurs
        const adaptiveDelay = baseDelay * userMultiplier + Math.random() * 1000;

        await new Promise((resolve) => setTimeout(resolve, adaptiveDelay));
      } catch (error) {
        requests++;
        if (error.response?.status === 429) {
          rateLimited++;
          this.stats.rateLimitErrors++;
          // Attente plus longue après rate limit
          await new Promise((resolve) => setTimeout(resolve, 5000));
        } else {
          failed++;
        }
      }
    }

    return { userId, requests, successful, failed, rateLimited, responseTimes };
  }

  async runOptimizedLoadTest(concurrentUsers, durationSeconds) {
    console.log(
      `🚀 Test de charge OPTIMISÉ: ${concurrentUsers} utilisateurs pendant ${durationSeconds}s`,
    );
    console.log(`⚙️  Stratégie: Délais adaptatifs + Retry avec backoff`);

    const startTime = Date.now();

    // Reset stats
    Object.keys(this.stats).forEach((key) => {
      if (typeof this.stats[key] === "number") this.stats[key] = 0;
    });
    this.stats.responseTimes = [];

    // Démarrage échelonné pour éviter la surcharge initiale
    const staggerDelay = Math.min(100, 2000 / concurrentUsers); // Max 100ms par utilisateur
    const userPromises = [];

    for (let i = 0; i < concurrentUsers; i++) {
      await new Promise((resolve) => setTimeout(resolve, staggerDelay));
      userPromises.push(
        this.simulateUserWithThrottling(i, durationSeconds * 1000),
      );
      console.log(`👤 Utilisateur ${i + 1} démarré`);
    }

    console.log(`⏳ Attente de la fin des ${concurrentUsers} utilisateurs...`);
    const results = await Promise.allSettled(userPromises);

    // Agréger les résultats
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        const userResult = result.value;
        this.stats.totalRequests += userResult.requests;
        this.stats.successfulRequests += userResult.successful;
        this.stats.failedRequests += userResult.failed;
        this.stats.responseTimes.push(...userResult.responseTimes);
      }
    });

    const actualDuration = (Date.now() - startTime) / 1000;
    this.stats.avgResponseTime =
      this.stats.responseTimes.length > 0
        ? this.stats.responseTimes.reduce((a, b) => a + b, 0) /
          this.stats.responseTimes.length
        : 0;

    return {
      users: concurrentUsers,
      duration: actualDuration,
      ...this.stats,
      requestsPerSecond: this.stats.totalRequests / actualDuration,
      maxResponseTime:
        this.stats.responseTimes.length > 0
          ? Math.max(...this.stats.responseTimes)
          : 0,
      minResponseTime:
        this.stats.responseTimes.length > 0
          ? Math.min(...this.stats.responseTimes)
          : 0,
    };
  }

  printOptimizedResults(result) {
    console.log("\n📊 RÉSULTATS OPTIMISÉS");
    console.log("=".repeat(50));
    console.log(`👥 Utilisateurs: ${result.users}`);
    console.log(`⏱️  Durée: ${result.duration.toFixed(2)}s`);
    console.log(`📈 Total requêtes: ${result.totalRequests}`);
    console.log(`✅ Succès: ${result.successfulRequests}`);
    console.log(`❌ Échecs: ${result.failedRequests}`);
    console.log(`🚦 Rate limited: ${result.rateLimitErrors}`);

    const successRate =
      (result.successfulRequests / result.totalRequests) * 100;
    console.log(`📊 Taux de succès: ${successRate.toFixed(2)}%`);
    console.log(`🚀 Req/sec: ${result.requestsPerSecond.toFixed(2)}`);
    console.log(`⚡ Temps moyen: ${result.avgResponseTime.toFixed(2)}ms`);
    console.log(`🐌 Temps max: ${result.maxResponseTime.toFixed(2)}ms`);

    // Analyse des performances avec rate limiting
    if (result.rateLimitErrors === 0 && successRate >= 98) {
      console.log("🟢 EXCELLENT: Aucun rate limit, performance optimale");
    } else if (
      result.rateLimitErrors < result.totalRequests * 0.05 &&
      successRate >= 95
    ) {
      console.log("🟡 BON: Rate limiting minimal, performance acceptable");
    } else if (result.rateLimitErrors < result.totalRequests * 0.2) {
      console.log("🟠 MOYEN: Rate limiting modéré, optimisations possibles");
    } else {
      console.log(
        "🔴 CRITIQUE: Rate limiting excessif, configuration à revoir",
      );
    }

    // Recommandations
    if (result.rateLimitErrors > 0) {
      const rateLimitPercent =
        (result.rateLimitErrors / result.totalRequests) * 100;
      console.log(`\n💡 RECOMMANDATION:`);
      console.log(
        `   ${rateLimitPercent.toFixed(1)}% des requêtes rate limitées`,
      );
      console.log(
        `   Augmenter la limite à ${Math.ceil((result.totalRequests / 60) * 1.2)} req/min`,
      );
    }
  }
}

async function runOptimizedLoadTest() {
  const loadTest = new OptimizedLoadTest();

  // Tests avec progression plus douce
  const scenarios = [
    { users: 5, duration: 30 },
    { users: 10, duration: 30 },
    { users: 15, duration: 45 },
    { users: 20, duration: 45 },
    { users: 30, duration: 60 },
  ];

  console.log("🎯 TEST DE CHARGE OPTIMISÉ POUR RATE LIMITING");
  console.log("=".repeat(60));
  console.log("⚙️  Stratégies: Backoff automatique, délais adaptatifs");
  console.log("🔄 Retry intelligent pour erreurs 429");

  for (const scenario of scenarios) {
    try {
      console.log(`\n${"=".repeat(40)}`);
      console.log(`🧪 ${scenario.users} utilisateurs - ${scenario.duration}s`);
      console.log(`${"=".repeat(40)}`);

      const result = await loadTest.runOptimizedLoadTest(
        scenario.users,
        scenario.duration,
      );
      loadTest.printOptimizedResults(result);

      // Pause plus longue pour éviter l'accumulation
      console.log("\n⏸️  Pause 20s (reset rate limit)...");
      await new Promise((resolve) => setTimeout(resolve, 20000));
    } catch (error) {
      console.error(
        `❌ Erreur scenario ${scenario.users} users:`,
        error.message,
      );
    }
  }
}

runOptimizedLoadTest().catch(console.error);
