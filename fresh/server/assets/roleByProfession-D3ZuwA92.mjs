function roleByProfession(organization_employment, profession) {
  if (organization_employment.is_admin) {
    return organization_employment;
  } else if (organization_employment.role === profession) {
    return organization_employment;
  }
}
export {
  roleByProfession as r
};
