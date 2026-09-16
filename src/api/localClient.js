const STORAGE_PREFIX = "procureflow_local_";

const seedData = {
  RFQ: [
    {
      id: "rfq-demo-1",
      rfq_code: "RFQ-2026-001",
      product_name: "Industrial safety gloves",
      buyer_company: "Demo Manufacturing",
      delivery_country: "United States",
      status: "Broadcast",
      source: "Manual",
      quantity: 5000,
      created_date: "2026-01-15T10:00:00.000Z",
      view_count: 0,
    },
  ],
  Supplier: [
    {
      id: "supplier-demo-1",
      company_name: "Northstar Industrial Supply",
      country: "United States",
      contact_name: "Alex Morgan",
      email: "alex@example.com",
      credits: 10,
      used_free_reveal: false,
      created_date: "2026-01-10T10:00:00.000Z",
    },
  ],
  FollowUpLog: [],
  BroadcastLog: [],
  AgentRun: [],
  AgentConfig: [],
  AppSettings: [],
  DatabaseConfig: [],
  CreditTransaction: [],
};

const readCollection = (entity) => {
  const key = `${STORAGE_PREFIX}${entity}`;
  const stored = localStorage.getItem(key);
  if (stored) return JSON.parse(stored);
  const initial = seedData[entity] || [];
  localStorage.setItem(key, JSON.stringify(initial));
  return [...initial];
};

const writeCollection = (entity, records) => {
  localStorage.setItem(`${STORAGE_PREFIX}${entity}`, JSON.stringify(records));
};

const sortRecords = (records, sort = "-created_date") => {
  const descending = sort.startsWith("-");
  const field = descending ? sort.slice(1) : sort;
  return [...records].sort((a, b) => {
    const left = a[field] ?? "";
    const right = b[field] ?? "";
    return (left > right ? 1 : left < right ? -1 : 0) * (descending ? -1 : 1);
  });
};

const createEntity = (entity) => ({
  async list(sort, limit) {
    const records = sortRecords(readCollection(entity), sort);
    return typeof limit === "number" ? records.slice(0, limit) : records;
  },
  async filter(filters = {}, sort, limit) {
    const records = readCollection(entity).filter((record) =>
      Object.entries(filters).every(([key, value]) => record[key] === value)
    );
    const sorted = sortRecords(records, sort);
    return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
  },
  async get(id) {
    return readCollection(entity).find((record) => record.id === id) || null;
  },
  async create(fields) {
    const record = {
      ...fields,
      id: fields.id || `${entity.toLowerCase()}-${crypto.randomUUID()}`,
      created_date: fields.created_date || new Date().toISOString(),
    };
    writeCollection(entity, [...readCollection(entity), record]);
    return record;
  },
  async update(id, fields) {
    const records = readCollection(entity);
    const index = records.findIndex((record) => record.id === id);
    if (index < 0) throw new Error(`${entity} record not found`);
    const updated = { ...records[index], ...fields };
    records[index] = updated;
    writeCollection(entity, records);
    return updated;
  },
  async bulkCreate(items) {
    const created = await Promise.all(items.map((item) => this.create(item)));
    return created;
  },
});

const readUsers = () => JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}users`) || "[]");
const writeUsers = (users) => localStorage.setItem(`${STORAGE_PREFIX}users`, JSON.stringify(users));

const auth = {
  async me() {
    const email = localStorage.getItem(`${STORAGE_PREFIX}current_user`);
    const user = readUsers().find((candidate) => candidate.email === email);
    if (!user) {
      throw Object.assign(new Error("Authentication required"), { status: 401 });
    }
    return user;
  },
  async register({ email, password }) {
    const users = readUsers();
    if (users.some((user) => user.email === email)) throw new Error("An account already exists");
    const user = { id: crypto.randomUUID(), email, password, role: "user" };
    writeUsers([...users, user]);
    return user;
  },
  async loginViaEmailPassword(email, password) {
    const user = readUsers().find((candidate) => candidate.email === email && candidate.password === password);
    if (!user) throw new Error("Invalid email or password");
    localStorage.setItem(`${STORAGE_PREFIX}current_user`, email);
    return user;
  },
  async verifyOtp({ email }) {
    localStorage.setItem(`${STORAGE_PREFIX}current_user`, email);
    return { access_token: email };
  },
  async resendOtp() {},
  async resetPasswordRequest() {},
  async resetPassword() {},
  setToken(token) {
    if (token) localStorage.setItem(`${STORAGE_PREFIX}current_user`, token);
  },
  loginWithProvider(provider, returnTo = "/") {
    if (provider !== "google") {
      throw new Error(`Local sign-in does not support ${provider}`);
    }

    const email = "local.google@example.com";
    const users = readUsers();
    if (!users.some((user) => user.email === email)) {
      writeUsers([
        ...users,
        {
          id: "local-google-user",
          email,
          name: "Local Google User",
          role: "user",
        },
      ]);
    }
    localStorage.setItem(`${STORAGE_PREFIX}current_user`, email);
    window.location.href = returnTo || "/";
  },
  logout() {
    localStorage.removeItem(`${STORAGE_PREFIX}current_user`);
    window.location.href = "/login";
  },
  redirectToLogin() {
    window.location.href = "/login";
  },
};

const functions = {
  async invoke(name) {
    if (name === "agentRun") return { data: { status: "completed", message: "Local agent run completed." } };
    if (name === "testChannel" || name === "testLlm") return { data: { ok: true, message: "Local test completed." } };
    if (name === "databaseConnect") return { data: { ok: true, message: "Local storage is available." } };
    if (name === "followupSweep") return { data: { ok: true, message: "Local follow-up sweep completed." } };
    if (name === "createCheckoutSession") return { data: { url: null, message: "Payments are disabled in local mode." } };
    return { data: {} };
  },
};

export const localClient = {
  auth,
  app: {
    async getPublicSettings() {
      return { id: "local", public_settings: {} };
    },
  },
  functions,
  entities: Object.fromEntries(Object.keys(seedData).map((entity) => [entity, createEntity(entity)])),
};
