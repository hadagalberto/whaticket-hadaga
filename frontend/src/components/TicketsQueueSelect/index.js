import React from "react";

import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { Checkbox, ListItemText, InputLabel } from "@material-ui/core";
import { i18n } from "../../translate/i18n";

const TicketsQueueSelect = ({
  userQueues,
  selectedQueueIds = [],
  onChange,
}) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  // Debug: verificar se as filas estão sendo recebidas
  console.log("TicketsQueueSelect - userQueues:", userQueues);

  return (
    <div style={{ width: 120, marginTop: -4 }}>
      <FormControl fullWidth margin="dense">
        <InputLabel>{i18n.t("ticketsQueueSelect.placeholder")}</InputLabel>
        <Select
          multiple
          displayEmpty
          variant="outlined"
          value={selectedQueueIds}
          onChange={handleChange}
          MenuProps={{
            anchorOrigin: {
              vertical: "bottom",
              horizontal: "left",
            },
            transformOrigin: {
              vertical: "top",
              horizontal: "left",
            },
            getContentAnchorEl: null,
          }}
          renderValue={(selected) => {
            if (selected.length === 0) {
              return i18n.t("ticketsQueueSelect.placeholder");
            }
            return selected.length === 1
              ? userQueues?.find((q) => q.id === selected[0])?.name || ""
              : `${selected.length} selecionadas`;
          }}
        >
          {userQueues && userQueues.length > 0 ? (
            userQueues.map((queue) => (
              <MenuItem dense key={queue.id} value={queue.id}>
                <Checkbox
                  style={{
                    color: queue.color,
                  }}
                  size="small"
                  color="primary"
                  checked={selectedQueueIds.indexOf(queue.id) > -1}
                />
                <ListItemText primary={queue.name} />
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>
              <ListItemText primary="Nenhuma fila disponível" />
            </MenuItem>
          )}
        </Select>
      </FormControl>
    </div>
  );
};

export default TicketsQueueSelect;
