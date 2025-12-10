import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import LeaderChangeLogs from '@/leader/leader-change-logs';

function LeaderChangeLogsPage() {
  return (
    <>
      <Head>
        <title>Change Logs - Team Leader</title>
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
            <LeaderChangeLogs />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

LeaderChangeLogsPage.getLayout = (page) => (
  <SidebarLayout userRole="leader">{page}</SidebarLayout>
);

export default LeaderChangeLogsPage;
