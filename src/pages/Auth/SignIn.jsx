import * as React from "react";
import { useState } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { IconButton, InputAdornment } from "@mui/material";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../actions/authAction";
import { resetPassAPI, sendOTPToResetPassAPI } from "../../api/userAPI";
import Notification from "../../components/Notification/Notification";

const defaultTheme = createTheme();

function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = () => setShowPassword(!showPassword);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state) => state.auth);
  const [load, setLoad] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const formData = {
      userName: data.get("email"),
      password: data.get("password"),
    };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (formData.userName.length === 0) {
      setErrorMsg("Vui lòng nhập địa chỉ Email.");
      return;
    }

    if (!emailRegex.test(formData.userName)) {
      setErrorMsg("Vui lòng nhập đúng định dạng Email.");
      return;
    }

    if (formData.password.length < 4) {
      setErrorMsg("Mật khẩu phải có ít nhất 4 ký tự.");
      return;
    }

    dispatch(login(formData));
    setErrorMsg("");
  };

  useEffect(() => {
    if (user && user.status) {
      setErrorMsg(user.status);
    } else {
      setErrorMsg("");
    }
  }, [user]);

  useEffect(() => {
    if (user && user.userName) {
      setSuccessMsg(true);
      navigate("/", { state: { successMessage: "Đăng Nhập Thành Công!" } });
    }
  }, [user, navigate]);

  const handleSubmitForgotPassword = async (event) => {
    setLoad(true);
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const formData = {
      userName: data.get("email"),
    };
    if (formData.userName.length === 0) {
      setErrorMsg("Vui lòng nhập tài khoản Email");
      return;
    }
    try {
      // await resetPassAPI(formData);
      // setShowNotification(true);
      // setShowForgotPassword(false); // Return to sign-in form
      const otpresponse = await sendOTPToResetPassAPI(formData.userName);
      navigate("/verify-account", {
        state: { userName: formData.userName, otp: otpresponse?.data?.OTP },
      });
    } catch (error) {
      setErrorMsg("Reset mật khẩu thất bại. Vui lòng thử lại.");
    } finally {
      setLoad(false);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      {showNotification && (
        <Notification
          message="Reset mật khẩu thành công. Vui lòng kiểm tra Email của bạn."
          onClose={() => setShowNotification(false)}
        />
      )}
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
            {showForgotPassword ? "Quên Mật Khẩu" : "Đăng Nhập"}
          </Typography>
          {showForgotPassword ? (
            <Box
              component="form"
              onSubmit={handleSubmitForgotPassword}
              noValidate
              sx={{ mt: 1 }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Địa chỉ Email"
                name="email"
                autoComplete="email"
                autoFocus
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                {load ? "Loading..." : "Gửi OTP"}
              </Button>
              <Link
                variant="body2"
                onClick={() => setShowForgotPassword(false)}
                style={{ cursor: "pointer" }}
              >
                Trở về đăng nhập
              </Link>
            </Box>
          ) : (
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ mt: 1 }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Địa chỉ Email"
                name="email"
                autoComplete="email"
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Mật khẩu"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                      >
                        {showPassword ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {errorMsg && (
                <Typography variant="body2" color="error">
                  {errorMsg}
                </Typography>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                {loading ? "Loading..." : "Đăng nhập"}
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link
                    variant="body2"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setErrorMsg("");
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    Quên mật khẩu?
                  </Link>
                </Grid>
                <Grid item>
                  <Link href="/signup">{"Không có tài khoản? Đăng ký"}</Link>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default SignIn;
