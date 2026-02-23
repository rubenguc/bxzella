// Central models registration file
// Import all models to ensure they are registered with Mongoose
// This prevents "Schema hasn't been registered for model" errors
// when populating referenced documents

import "@/features/accounts/model/accounts-model";
import "@/features/day-log/model/day-log-model";
import "@/features/trades/model/trades-model";
import "@/features/trades/playbook-trade-progress/model/playbook-trade-progress-model";
import "@/features/notebooks/model/notebooks-model";
import "@/features/notebooks/model/notebooks-folder-model";
import "@/features/playbooks/model/playbooks-model";
