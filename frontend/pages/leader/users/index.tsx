import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import LeaderUsers from '@/leader/leader-users';

function LeaderUsersPage() {
  return (
    <>
      <Head>
        <title>Users - Team Leader</title>
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
            <LeaderUsers />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

LeaderUsersPage.getLayout = (page) => (
  <SidebarLayout userRole="leader">{page}</SidebarLayout>
);

export default LeaderUsersPage;
