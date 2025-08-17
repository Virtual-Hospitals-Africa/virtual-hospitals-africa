# 💜 Virtual Hospitals Africa

🩺 Learn more about how we're connecting patients with care at [virtualhospitalsafrica.org](https://virtualhospitalsafrica.org)

💌 Wanting to contribute? See our open positions on [Idealist](https://www.idealist.org/en/nonprofit/318fda9457534eafa3fa691bba19f5ae-virtual-hospitals-africa-polokwane)

🛠️ Check out our [Engineering](https://virtualhospitalsafrica.notion.site/Engineering-bd877fee6c2f477e9f8b33550162304e?source=copy_link) documentation to learn how the system is architected and how to run it

# To get up and running

- Create `.env` file and add variables

```
FOO=BAR
```

- Run `docker compose up -d` (or `docker compose up` if you want to see logs in real-time)
- Run `deno task db:reset`
- Run `deno task start`

*** To view/modify the Postgres database ***

- Navigate to http://localhost:8888/?pgsql=postgres&username=runner&db=vha_dev
- Enter password `testpw`
