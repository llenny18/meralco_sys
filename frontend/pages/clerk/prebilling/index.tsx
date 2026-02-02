import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import ClerkNotifications from '@/clerk/prebilling';

function ClerkNotificationsPage() {
  return (
    <>
      <Head>
        <title>Prebilling - Clerk Portal</title>
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
            <ClerkNotifications />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

ClerkNotificationsPage.getLayout = (page) => (
  <SidebarLayout userRole="clerk">{page}</SidebarLayout>
);

export default ClerkNotificationsPage;
