import { Box, Button, Grid, Paper, TextField, Typography } from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';

type PinFormInput = {
    pin: number;
};

export default function Home() {
    const router = useRouter();
    const { control, handleSubmit } = useForm<PinFormInput>();

    const onSubmit: SubmitHandler<PinFormInput> = async (data) => {
        const response = await fetch('/api/customer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin: data.pin }),
        });

        const { result } = await response.json();

        if (result) {
            router.push({
                pathname: '/atm',
                query: {
                    firstName: result.firstName,
                    lastName: result.lastName,
                    account: result.account,
                },
            });
        }
    };

    return (
        <>
            <Head>
                <title>Basic ATM - Pin entry</title>
                <meta
                    name="description"
                    content="Generated by create next app"
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main>
                <Box maxWidth="md" sx={{ margin: 'auto' }}>
                    <Paper sx={{ padding: '2em' }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sx={{ textAlign: 'center' }}>
                                <Typography variant="h2">Basic ATM</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Grid container sx={{ textAlign: 'center' }}>
                                    <Grid item xs={12}>
                                        <form onSubmit={handleSubmit(onSubmit)}>
                                            <Controller
                                                name="pin"
                                                control={control}
                                                rules={{
                                                    required: true,
                                                    minLength: 4,
                                                    maxLength: 4,
                                                }}
                                                render={({ field }) => (
                                                    <TextField
                                                        {...field}
                                                        InputLabelProps={{
                                                            shrink: true,
                                                        }}
                                                    />
                                                )}
                                            />
                                            <Button
                                                type="submit"
                                                variant="contained"
                                            >
                                                Submit
                                            </Button>
                                        </form>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Paper>
                </Box>
            </main>
        </>
    );
}
