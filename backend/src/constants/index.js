module.exports = Object.freeze({
  STATUS: {
    SUCCESS: "success",
    ERROR: "error"
  },

  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500
  },

  FAITHS: {
    ISLAM: "islam",
    CHRISTIANITY: "christianity",
    HINDUISM: "hinduism",
    BUDDHISM: "buddhism",
    JUDAISM: "judaism",
    SIKHISM: "sikhism",
    TAOISM: "taoism",
    CONFUCIANISM: "confucianism",
    JAINISM: "jainism",
    SHINTOISM: "shintoism",
    BAHAI_FAITH: "bahai",
    ZOROASTRIANISM: "zoroastrianism",
    CAO_DAI: "caodai",
    TENRIKYO: "tenrikyo",
    ANIMISM: "animism",
    PAGANISM: "paganism",
    NEO_PAGANISM: "neo_paganism",
    DRUIDRY: "druidry",
    SHAMANISM: "shamanism",
    YAZIDISM: "yazidism",
    SAMARITANISM: "samaritanism",
    RASTAFARIANISM: "rastafarianism",
    UNITARIAN_UNIVERSALISM: "unitarian_universalism",
    SPIRITUALISM: "spiritualism",
    FALUN_GONG: "falun_gong",
    CHINESE_FOLK_RELIGION: "chinese_folk_religion",
    AFRICAN_TRADITIONAL_RELIGIONS: "african_traditional_religions",
    INDIGENOUS_RELIGIONS: "indigenous_religions",
    ANCIENT_EGYPTIAN_RELIGION: "ancient_egyptian_religion",
    GREEK_RELIGION: "ancient_greek_religion",
    ROMAN_RELIGION: "ancient_roman_religion",
    NORSE_RELIGION: "norse_religion",
    MESOPOTAMIAN_RELIGION: "mesopotamian_religion",
    ATHEISM: "atheism",
    AGNOSTICISM: "agnosticism",
    DEISM: "deism",
    SECULAR_HUMANISM: "secular_humanism"
  },
  NOTIFICATION_TYPES: {
    FOLLOW: "FOLLOW",
    POST_LIKE: "POST_LIKE",
    POST_COMMENT: "POST_COMMENT",
    REEL_LIKE: "REEL_LIKE",
    REEL_COMMENT: "REEL_COMMENT",
    LIKE: "LIKE",
    MESSAGE: "MESSAGE",
    NEW_POST: "NEW_POST",
    SYSTEM: "SYSTEM",
  },


  ROLES: {
    WORSHIPER: "worshiper",
    LEADER: "leader"
  },

  HEADERS: {
    AUTH: "authorization",
    REQUEST_ID: "x-request-id",
    CLIENT: "x-client",
    APP_VERSION: "x-app-version"
  },

  LOG_SOURCE: {
    BACKEND: "backend",
    FRONTEND: "frontend"
  }
});
