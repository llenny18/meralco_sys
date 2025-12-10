import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import LeaderEscalationRules from '@/leader/leader-escalation-rules';

function LeaderEscalationRulesPage() {
  return (
    <>
      <Head>
        <title>Escalation Rules - Team Leader</title>
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
            <LeaderEscalationRules />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

LeaderEscalationRulesPage.getLayout = (page) => (
  <SidebarLayout userRole="leader">{page}</SidebarLayout>
);

export default LeaderEscalationRulesPage;
