import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import SupervisorChangeLogs from '@/supervisor/supervisor-change-logs';

function SupervisorChangeLogsPage() {
  return (
    <>
      <Head>
        <title>Change Logs - WO Supervisor</title>
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
            <SupervisorChangeLogs />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

SupervisorChangeLogsPage.getLayout = (page) => (
  <SidebarLayout userRole="supervisor">{page}</SidebarLayout>
);

export default SupervisorChangeLogsPage;
