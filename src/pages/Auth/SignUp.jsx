import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { sendOTP } from "../../api/userAPI";

const defaultTheme = createTheme();

function SignUp() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isOtpSent, setIsOtpSent] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const email = data.get("email");

    if (!emailRegex.test(email)) {
      setErrorMsg("Vui lòng nhập đúng định dạng email!");
      return;
    }

    if (data.get("password") !== data.get("confirmPassword")) {
      setErrorMsg("Mật khẩu và Xác nhận mật khẩu không trùng khớp!");
      return;
    }
    const formData = {
      userName: email,
      password: data.get("password"),
    };

    try {
      const response = await sendOTP({ userName: formData.userName });

      if (response.data.code === 500) {
        setErrorMsg("Email đã tồn tại trong hệ thống!");
      } else if (response.status === 201) {
        setIsOtpSent(true);
        navigate("/signup/verify-otp", {
          state: { formData, generatedOtp: response.data },
        });
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      setErrorMsg("Xuất hiện lỗi khi gửi xác thực OTP!");
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Đăng ký
          </Typography>
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ mt: 3 }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Địa chỉ Email"
                  name="email"
                  autoComplete="email"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Mật khẩu"
                  type="password"
                  id="password"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Xác nhận mật khẩu"
                  type="password"
                  id="confirmPassword"
                />
              </Grid>
              {errorMsg && (
                <Typography
                  variant="body2"
                  color="error"
                  sx={{ marginTop: 1, marginLeft: 2 }}
                >
                  {errorMsg}
                </Typography>
              )}
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Gửi OTP
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/signin" variant="body2">
                  Đã có tài khoản? Đăng nhập
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default SignUp;
