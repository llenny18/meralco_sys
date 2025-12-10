import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import LeaderPenaltyRules from '@/leader/leader-penalty-rules';

function LeaderPenaltyRulesPage() {
  return (
    <>
      <Head>
        <title>Penalty Rules - Team Leader</title>
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
            <LeaderPenaltyRules />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

LeaderPenaltyRulesPage.getLayout = (page) => (
  <SidebarLayout userRole="leader">{page}</SidebarLayout>
);

export default LeaderPenaltyRulesPage;
