module.exports = {
  randomString,
  timestamp,
  setupScenario,
  logResponse
};

function randomString(context, events, done) {
  context.vars.randomString = Math.random().toString(36).substring(7);
  return done();
}

function timestamp(context, events, done) {
  context.vars.timestamp = new Date().toISOString();
  return done();
}

function setupScenario(context, events, done) {
  // Configuration globale pour les scénarios
  context.vars.testStartTime = Date.now();
  return done();
}

function logResponse(requestParams, response, context, ee, next) {
  // Logger les réponses pour debug
  if (response.statusCode >= 400) {
    console.log(`❌ Erreur ${response.statusCode}: ${requestParams.url}`);
  }
  return next();
}
