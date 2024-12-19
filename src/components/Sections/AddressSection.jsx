import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import { useState } from "react";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  // border: "2px solid #000",
  borderradius: 8,
  boxShadow: 24,
  p: 4,
};

const AddressSection = () => {
  const address = true;

  const addressList = [
    {
      fullname: "Tran Huu Nha",
      phoneNumber: "0912910109",
      city: "Ho Chi Minh City",
      specificAddress: "tran huu nha nahahh hacbhabc",
    },
    {
      fullname: "Tran Huu Nha",
      phoneNumber: "0912910109",
      city: "Ho Chi Minh City",
      specificAddress: "tran huu nha nahahh hacbhabc",
    },
  ];

  const [open, setOpen] = useState(false);
  const [defaultAddress, setDefaultAddress] = useState(0);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [city, setCity] = React.useState("");

  const handleChange = (event) => {
    setCity(event.target.value);
  };

  const handleSetDefault = (index) => {
    setDefaultAddress(index);
  };

  return (
    <>
      <div className="address-header">
        <div>
          <h2>Your Address</h2>
        </div>
        {address && (
          <Button size="small" variant="outlined" onClick={handleOpen}>
            New Address
          </Button>
        )}
      </div>

      {address ? (
        <>
          {addressList.map((items, index) => (
            <div className="address-body" key={index}>
              <div className="items-left">
                <a>{items.fullname}</a>
                <a>{items.phoneNumber}</a>
                <a>
                  {items.city} - {items.specificAddress}
                </a>
              </div>
              <div className="items-right">
                <div className="items-action">
                  <a>Update</a>
                  <a>Delete</a>
                </div>
                <button
                  className="btn-set-default"
                  onClick={() => handleSetDefault(index)}
                  disabled={defaultAddress === index} // Disable if this is the default address
                  style={{
                    backgroundColor: defaultAddress === index ? "gray" : "blue",
                    color: "white",
                  }}
                >
                  {defaultAddress === index ? "Default" : "Set as default"}
                </button>
              </div>
            </div>
          ))}
        </>
      ) : (
        <div className="address-body">
          <h3> You don't have address</h3>
          <Button variant="outlined" onClick={handleOpen}>
            New Address
          </Button>
        </div>
      )}

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography
            sx={{
              paddingBottom: "8px",
            }}
            id="modal-modal-title"
            variant="h6"
            component="h2"
          >
            New Address
          </Typography>
          <div>
            <div className="input-row form-padding">
              <TextField
                required
                id="outlined-basic"
                label="Fullname"
                variant="outlined"
              />
              <TextField
                required
                id="outlined-basic"
                label="Phone number"
                variant="outlined"
                type="number"
              />
            </div>
            <div className="form-padding">
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">City</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={city}
                  label="City"
                  onChange={handleChange}
                >
                  <MenuItem value={10}>Ho Chi Minh City</MenuItem>
                  <MenuItem value={20}>Da nang City</MenuItem>
                  <MenuItem value={30}>Ha Noi city</MenuItem>
                  <MenuItem value={30}>Can tho city</MenuItem>
                  <MenuItem value={30}>Hai phong city</MenuItem>
                </Select>
              </FormControl>
            </div>

            <div className="form-padding">
              <TextField
                id="outlined-multiline-flexible"
                label="Specific address"
                multiline
                maxRows={4}
                variant="outlined"
                fullWidth
              />
            </div>
            <div className="button-section form-padding">
              <Button color="secondary">Cancel</Button>
              <Button variant="contained" color="primary">
                Save
              </Button>
            </div>
          </div>
        </Box>
      </Modal>
    </>
  );
};

export default AddressSection;
