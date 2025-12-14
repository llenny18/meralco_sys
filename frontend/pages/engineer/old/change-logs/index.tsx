import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import EngineerChangeLogs from '@/engineer/old/engineer-change-logs';

function EngineerChangeLogsPage() {
  return (
    <>
      <Head>
        <title>Change History - Engineer Portal</title>
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
            <EngineerChangeLogs />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

EngineerChangeLogsPage.getLayout = (page) => (
  <SidebarLayout userRole="engineer">{page}</SidebarLayout>
);

export default EngineerChangeLogsPage;
