import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import LeaderBilling from '@/leader/leader-billing';

function LeaderBillingPage() {
  return (
    <>
      <Head>
        <title>Billing Overview - Team Leader</title>
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
            <LeaderBilling />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

LeaderBillingPage.getLayout = (page) => (
  <SidebarLayout userRole="leader">{page}</SidebarLayout>
);

export default LeaderBillingPage;
