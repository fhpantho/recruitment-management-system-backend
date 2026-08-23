import { Request, Response } from "express";
import { supabase } from "../config/supabase.js";

// ==========================================
// GET ALL DEMANDS FOR A CLIENT
// ==========================================

export const getClientDemands = async (
  req: Request,
  res: Response
) => {
  try {
    const { clientId } = req.params;

    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: "Client ID is required",
      });
    }

    // ------------------------------
    // CHECK CLIENT
    // ------------------------------

    const { data: client, error: clientError } =
      await supabase
        .from("clients")
        .select("id, name, code")
        .eq("id", clientId)
        .single();

    if (clientError || !client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // ------------------------------
    // GET PROJECTS OF CLIENT
    // ------------------------------

    const { data: projects, error: projectError } =
      await supabase
        .from("projects")
        .select(`
          id,
          client_id,
          country_id,
          name,
          project_number,
          status,
          priority
        `)
        .eq("client_id", clientId)
        .order("name", {
          ascending: true,
        });

    if (projectError) {
      console.error(
        "Get client projects error:",
        projectError
      );

      return res.status(500).json({
        success: false,
        message: "Failed to fetch client projects",
        error: projectError.message,
      });
    }

    if (!projects || projects.length === 0) {
      return res.status(200).json({
        success: true,
        client,
        demands: [],
      });
    }

    const projectIds = projects.map(
      (project) => project.id
    );

    // ------------------------------
    // GET DEMANDS
    // ------------------------------

    const { data: demands, error: demandError } =
      await supabase
        .from("demands")
        .select(`
          id,
          employer_id,
          project_id,
          demand_number,
          opening_date,
          closing_date,
          status,
          created_by,
          created_at,
          updated_at
        `)
        .in("project_id", projectIds)
        .order("created_at", {
          ascending: false,
        });

    if (demandError) {
      console.error(
        "Get client demands error:",
        demandError
      );

      return res.status(500).json({
        success: false,
        message: "Failed to fetch demands",
        error: demandError.message,
      });
    }

    // ------------------------------
    // ATTACH PROJECT INFORMATION
    // ------------------------------

    const projectMap = new Map(
      projects.map((project) => [
        project.id,
        project,
      ])
    );

    const formattedDemands = (
      demands || []
    ).map((demand) => ({
      ...demand,
      project:
        projectMap.get(demand.project_id) || null,
    }));

    return res.status(200).json({
      success: true,
      client,
      demands: formattedDemands,
    });
  } catch (error) {
    console.error(
      "Get client demands exception:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ==========================================
// GET SINGLE DEMAND
// ==========================================

export const getDemand = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Demand ID is required",
      });
    }

    const { data: demand, error } =
      await supabase
        .from("demands")
        .select(`
          id,
          employer_id,
          project_id,
          demand_number,
          opening_date,
          closing_date,
          status,
          created_by,
          created_at,
          updated_at
        `)
        .eq("id", id)
        .single();

    if (error || !demand) {
      return res.status(404).json({
        success: false,
        message: "Demand not found",
      });
    }

    // ------------------------------
    // GET PROJECT
    // ------------------------------

    let project = null;

    if (demand.project_id) {
      const { data: projectData } =
        await supabase
          .from("projects")
          .select(`
            id,
            client_id,
            country_id,
            name,
            project_number,
            description,
            start_date,
            target_date,
            status,
            priority
          `)
          .eq("id", demand.project_id)
          .single();

      project = projectData || null;
    }

    // ------------------------------
    // GET CLIENT
    // ------------------------------

    let client = null;

    if (project?.client_id) {
      const { data: clientData } =
        await supabase
          .from("clients")
          .select(`
            id,
            name,
            code,
            country_id
          `)
          .eq("id", project.client_id)
          .single();

      client = clientData || null;
    }

    return res.status(200).json({
      success: true,
      demand: {
        ...demand,
        project,
        client,
      },
    });
  } catch (error) {
    console.error(
      "Get demand exception:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ==========================================
// CREATE DEMAND
// ==========================================

export const createDemand = async (
  req: Request,
  res: Response
) => {
  try {
    const { clientId } = req.params;

    const {
      project_id,
      employer_id,
      demand_number,
      opening_date,
      closing_date,
      status,
    } = req.body;

    // ------------------------------
    // VALIDATION
    // ------------------------------

    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: "Client ID is required",
      });
    }

    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: "Project is required",
      });
    }

    if (!demand_number?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Demand number is required",
      });
    }

    // ------------------------------
    // CHECK PROJECT
    // ------------------------------

    const {
      data: project,
      error: projectError,
    } = await supabase
      .from("projects")
      .select(`
        id,
        client_id,
        name,
        project_number
      `)
      .eq("id", project_id)
      .single();

    if (projectError || !project) {
      return res.status(400).json({
        success: false,
        message: "Project not found",
      });
    }

    // ------------------------------
    // MAKE SURE PROJECT BELONGS TO CLIENT
    // ------------------------------

    if (project.client_id !== clientId) {
      return res.status(403).json({
        success: false,
        message:
          "This project does not belong to this client",
      });
    }

    // ------------------------------
    // CHECK DEMAND NUMBER
    // ------------------------------

    const {
      data: existingDemand,
    } = await supabase
      .from("demands")
      .select("id")
      .eq(
        "demand_number",
        demand_number.trim()
      )
      .maybeSingle();

    if (existingDemand) {
      return res.status(409).json({
        success: false,
        message:
          "Demand number already exists",
      });
    }

    // ------------------------------
    // VALIDATE STATUS
    // ------------------------------

    const allowedStatuses = [
      "open",
      "closed",
      "cancelled",
    ];

    const demandStatus =
      status || "open";

    if (
      !allowedStatuses.includes(
        demandStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid demand status",
      });
    }

    // ------------------------------
    // VALIDATE DATES
    // ------------------------------

    if (
      opening_date &&
      closing_date &&
      new Date(opening_date) >
        new Date(closing_date)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Closing date cannot be before opening date",
      });
    }

    // ------------------------------
    // CREATE DEMAND
    // ------------------------------

    const { data, error } =
      await supabase
        .from("demands")
        .insert({
          project_id,
          employer_id:
            employer_id || null,
          demand_number:
            demand_number.trim(),
          opening_date:
            opening_date || null,
          closing_date:
            closing_date || null,
          status: demandStatus,
        })
        .select(`
          id,
          employer_id,
          project_id,
          demand_number,
          opening_date,
          closing_date,
          status,
          created_by,
          created_at,
          updated_at
        `)
        .single();

    if (error) {
      console.error(
        "Create demand error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to create demand",
        error: error.message,
      });
    }

    return res.status(201).json({
      success: true,
      message:
        "Demand created successfully",
      demand: data,
    });
  } catch (error) {
    console.error(
      "Create demand exception:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ==========================================
// UPDATE DEMAND
// ==========================================

export const updateDemand = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const {
      project_id,
      employer_id,
      demand_number,
      opening_date,
      closing_date,
      status,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Demand ID is required",
      });
    }

    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: "Project is required",
      });
    }

    if (!demand_number?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Demand number is required",
      });
    }

    // ------------------------------
    // CHECK DEMAND
    // ------------------------------

    const {
      data: existingDemand,
      error: existingError,
    } = await supabase
      .from("demands")
      .select(`
        id,
        demand_number
      `)
      .eq("id", id)
      .single();

    if (
      existingError ||
      !existingDemand
    ) {
      return res.status(404).json({
        success: false,
        message: "Demand not found",
      });
    }

    // ------------------------------
    // CHECK PROJECT
    // ------------------------------

    const {
      data: project,
      error: projectError,
    } = await supabase
      .from("projects")
      .select("id")
      .eq("id", project_id)
      .single();

    if (projectError || !project) {
      return res.status(400).json({
        success: false,
        message: "Project not found",
      });
    }

    // ------------------------------
    // CHECK DUPLICATE DEMAND NUMBER
    // ------------------------------

    const {
      data: duplicateDemand,
    } = await supabase
      .from("demands")
      .select("id")
      .eq(
        "demand_number",
        demand_number.trim()
      )
      .neq("id", id)
      .maybeSingle();

    if (duplicateDemand) {
      return res.status(409).json({
        success: false,
        message:
          "Demand number already exists",
      });
    }

    // ------------------------------
    // STATUS
    // ------------------------------

    const allowedStatuses = [
      "open",
      "closed",
      "cancelled",
    ];

    const demandStatus =
      status || "open";

    if (
      !allowedStatuses.includes(
        demandStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid demand status",
      });
    }

    // ------------------------------
    // DATE VALIDATION
    // ------------------------------

    if (
      opening_date &&
      closing_date &&
      new Date(opening_date) >
        new Date(closing_date)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Closing date cannot be before opening date",
      });
    }

    // ------------------------------
    // UPDATE
    // ------------------------------

    const { data, error } =
      await supabase
        .from("demands")
        .update({
          project_id,
          employer_id:
            employer_id || null,
          demand_number:
            demand_number.trim(),
          opening_date:
            opening_date || null,
          closing_date:
            closing_date || null,
          status: demandStatus,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", id)
        .select(`
          id,
          employer_id,
          project_id,
          demand_number,
          opening_date,
          closing_date,
          status,
          created_by,
          created_at,
          updated_at
        `)
        .single();

    if (error) {
      console.error(
        "Update demand error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update demand",
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Demand updated successfully",
      demand: data,
    });
  } catch (error) {
    console.error(
      "Update demand exception:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ==========================================
// DELETE DEMAND
// ==========================================

export const deleteDemand = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Demand ID is required",
      });
    }

    // ------------------------------
    // CHECK DEMAND
    // ------------------------------

    const {
      data: demand,
      error: demandError,
    } = await supabase
      .from("demands")
      .select("id")
      .eq("id", id)
      .single();

    if (
      demandError ||
      !demand
    ) {
      return res.status(404).json({
        success: false,
        message: "Demand not found",
      });
    }

    // ------------------------------
    // DELETE
    // ------------------------------

    const { error } =
      await supabase
        .from("demands")
        .delete()
        .eq("id", id);

    if (error) {
      console.error(
        "Delete demand error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete demand. It may contain related records.",
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Demand deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete demand exception:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};