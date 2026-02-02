import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import ClerkChangeLogs from '@/clerk/documents-support';

function ClerkChangeLogsPage() {
  return (
    <>
      <Head>
        <title>Document Support - Clerk Portal</title>
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
            <ClerkChangeLogs />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

ClerkChangeLogsPage.getLayout = (page) => (
  <SidebarLayout userRole="clerk">{page}</SidebarLayout>
);

export default ClerkChangeLogsPage;
