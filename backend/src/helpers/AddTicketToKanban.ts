import Setting from "../models/Setting";
import Ticket from "../models/Ticket";
import KanbanColumn from "../models/KanbanColumn";

const AddTicketToKanban = async (ticketId: number): Promise<void> => {
  try {
    // Verificar se a funcionalidade está habilitada
    const autoAddSetting = await Setting.findOne({
      where: { key: "kanbanAutoAdd" }
    });

    if (!autoAddSetting || autoAddSetting.value !== "enabled") {
      return;
    }

    // Obter configurações do quadro e coluna padrão
    const [defaultBoardSetting, defaultColumnSetting] = await Promise.all([
      Setting.findOne({ where: { key: "kanbanDefaultBoard" } }),
      Setting.findOne({ where: { key: "kanbanDefaultColumn" } })
    ]);

    if (
      !defaultBoardSetting ||
      !defaultColumnSetting ||
      !defaultBoardSetting.value ||
      !defaultColumnSetting.value
    ) {
      return;
    }

    const kanbanColumnId = parseInt(defaultColumnSetting.value);

    // Verificar se a coluna existe
    const kanbanColumn = await KanbanColumn.findByPk(kanbanColumnId);
    if (!kanbanColumn) {
      return;
    }

    // Verificar se o ticket existe e não está já no Kanban
    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket || ticket.kanbanColumnId) {
      return;
    }

    // Obter a próxima posição na coluna
    const maxPosition = (await Ticket.max("kanbanPosition", {
      where: { kanbanColumnId }
    })) as number;

    const nextPosition = (maxPosition || -1) + 1;

    // Adicionar ticket ao Kanban
    await ticket.update({
      kanbanColumnId,
      kanbanPosition: nextPosition
    });

    console.log(
      `Ticket ${ticketId} automatically added to Kanban column ${kanbanColumnId}`
    );
  } catch (error) {
    console.error("Error adding ticket to Kanban automatically:", error);
    // Não lançar erro para não quebrar o fluxo principal
  }
};

export default AddTicketToKanban;
