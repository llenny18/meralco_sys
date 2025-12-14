import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import SupervisorEscalationRules from '@/engineer/supervisor-escalation-rules';

function SupervisorEscalationRulesPage() {
  return (
    <>
      <Head>
        <title>Escalation Rules - WO Supervisor</title>
      </Head>
      <Container maxWidth="lg">
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="stretch"
          spacing={3}
        >
          <Grid item xs={12}>
            <SupervisorEscalationRules />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

SupervisorEscalationRulesPage.getLayout = (page) => (
  <SidebarLayout userRole="supervisor">{page}</SidebarLayout>
);

export default SupervisorEscalationRulesPage;
