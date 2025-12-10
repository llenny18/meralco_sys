import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import LeaderSlaRules from '@/leader/leader-sla-rules';

function LeaderSlaRulesPage() {
  return (
    <>
      <Head>
        <title>SLA Rules Management - Team Leader</title>
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
            <LeaderSlaRules />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

LeaderSlaRulesPage.getLayout = (page) => (
  <SidebarLayout userRole="leader">{page}</SidebarLayout>
);

export default LeaderSlaRulesPage;
