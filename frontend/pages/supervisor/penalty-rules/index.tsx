import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import SupervisorPenaltyRules from '@/supervisor/supervisor-penalty-rules';

function SupervisorPenaltyRulesPage() {
  return (
    <>
      <Head>
        <title>Penalty Rules - WO Supervisor</title>
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
            <SupervisorPenaltyRules />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

SupervisorPenaltyRulesPage.getLayout = (page) => (
  <SidebarLayout userRole="supervisor">{page}</SidebarLayout>
);

export default SupervisorPenaltyRulesPage;
