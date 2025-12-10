import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import AideChangeLogs from '@/aide/aide-change-logs';

function AideChangeLogsPage() {
  return (
    <>
      <Head>
        <title>Change History - Engineering Aide</title>
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
            <AideChangeLogs />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

AideChangeLogsPage.getLayout = (page) => (
  <SidebarLayout userRole="aide">{page}</SidebarLayout>
);

export default AideChangeLogsPage;
