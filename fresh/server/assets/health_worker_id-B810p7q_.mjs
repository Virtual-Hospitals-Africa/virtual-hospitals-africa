function healthWorkerIdOfEmploymentId(trx, employment_id) {
  return trx.selectFrom("employment as health_worker_employment").where("health_worker_employment.id", "=", employment_id).select("health_worker_id as id");
}
export {
  healthWorkerIdOfEmploymentId as h
};
